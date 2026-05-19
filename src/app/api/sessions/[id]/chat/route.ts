import { NextResponse } from "next/server";
import { kvGet, kvSet } from "../../../../lib/kv";

async function getGitHubToken(): Promise<string> {
  const t = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  if (t) return t;
  try {
    const { execSync } = await import("child_process");
    return execSync("gh auth token", { timeout: 5000, encoding: "utf-8" }).trim();
  } catch {}
  return "";
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await _request.json();
  const { message } = body;

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  try {
    // Load session
    let session: any = await kvGet(`session:${id}`);
    if (!session) {
      const home = process.env.HOME || "/home/adminmac";
      const { execSync } = await import("child_process");
      const out = execSync(
        `cat "${home}/.hermes/sessions/session_${id}.json" 2>/dev/null`,
        { timeout: 5000, encoding: "utf-8" }
      );
      if (out.trim()) session = JSON.parse(out.trim());
    }
    if (!session) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    let fullContent = "";

    // Method 1: Try hermes CLI (works locally)
    try {
      const { spawn } = await import("child_process");
      fullContent = await new Promise<string>((resolve, reject) => {
        const proc = spawn("hermes", ["chat", "-q", message, "--resume", id, "--quiet", "-Q"], {
          timeout: 120000,
          env: { ...process.env, TERM: "dumb", PAGER: "cat" },
        });
        let out = "", err = "";
        proc.stdout.on("data", (d: Buffer) => { out += d.toString(); });
        proc.stderr.on("data", (d: Buffer) => { err += d.toString(); });
        proc.on("close", (code) => {
          if (code === 0 && out.trim()) {
            // Strip the "session_id: ..." line from the output
            const lines = out.trim().split("\n");
            const response = lines.filter(l => !l.startsWith("session_id:")).join("\n").trim();
            if (response) resolve(response);
            else reject(new Error("empty response"));
          } else reject(new Error(err || out || `exit ${code}`));
        });
        proc.on("error", reject);
      });
      if (fullContent) console.log("hermes CLI worked!");
    } catch (e: any) {
      console.log("hermes CLI failed:", e.message);
      const ghToken = await getGitHubToken();
      if (!ghToken) {
        return NextResponse.json({
          error: "No se pudo conectar. Si estás en local: asegúrate de que 'hermes' funciona. Si estás en Vercel: configura GITHUB_TOKEN."
        }, { status: 500 });
      }

      const messages = [
        { role: "system", content: session.system_prompt || "Eres un asistente." },
        ...(session.messages || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ];

      const res = await fetch("https://opencode.ai/zen/go/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ghToken}` },
        body: JSON.stringify({ model: "gpt-5.2-codex", messages, max_tokens: 2048 }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `OpenCode API error: ${err.slice(0, 200)}` }, { status: 500 });
      }

      const data = await res.json();
      fullContent = data.choices?.[0]?.message?.content || "";
    }

    // Save to session
    session.messages = session.messages || [];
    session.messages.push({ role: "user", content: message });
    session.messages.push({ role: "assistant", content: fullContent });
    session.last_updated = new Date().toISOString();

    await kvSet(`session:${id}`, session);

    // Stream back
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = fullContent.split(/(?<=\s)/);
        let i = 0;
        const send = () => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(JSON.stringify({ content: words[i] }) + "\n"));
            i++;
            setTimeout(send, 12);
          } else {
            controller.close();
          }
        };
        send();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
