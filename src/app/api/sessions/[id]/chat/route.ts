import { NextResponse } from "next/server";
import { kvGet } from "../../../../lib/kv";

async function getGitHubToken(): Promise<string> {
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  if (envToken) return envToken;
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
    // Load session from KV (works in Vercel) or local filesystem
    let session: any = await kvGet(`session:${id}`);

    if (!session) {
      // Fallback to local filesystem
      const home = process.env.HOME || "/home/adminmac";
      const { execSync } = await import("child_process");
      const out = execSync(
        `cat "${home}/.hermes/sessions/session_${id}.json" 2>/dev/null`,
        { timeout: 5000, encoding: "utf-8" }
      );
      if (out.trim()) {
        session = JSON.parse(out.trim());
      }
    }

    if (!session) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    // OpenCode endpoint + model
    const apiBaseUrl = "https://opencode.ai/zen/go/v1";
    const model = "gpt-5.2-codex";

    // Get GitHub token for auth
    const ghToken = await getGitHubToken();
    if (!ghToken) {
      return NextResponse.json({
        error: "No GITHUB_TOKEN set in env. Run 'gh auth login' or set GITHUB_TOKEN in Vercel."
      }, { status: 500 });
    }

    // Build messages
    const messages = [
      { role: "system", content: session.system_prompt || "You are a helpful assistant." },
      ...(session.messages || []).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenCode API
    const res = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ghToken}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({
        error: `API error (${res.status}): ${errText.slice(0, 300)}`
      }, { status: 500 });
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "no stream" }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"));
            for (const line of lines) {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content || "";
                if (content) {
                  fullContent += content;
                  controller.enqueue(encoder.encode(JSON.stringify({ content }) + "\n"));
                }
              } catch {}
            }
          }
          // Save messages back to KV
          if (fullContent) {
            session.messages = session.messages || [];
            session.messages.push({ role: "user", content: message });
            session.messages.push({ role: "assistant", content: fullContent });
            session.last_updated = new Date().toISOString();
            const kvUrl = process.env.KV_REST_API_URL;
            const kvToken = process.env.KV_REST_API_TOKEN;
            if (kvUrl && kvToken) {
              await fetch(`${kvUrl}/set/session:${id}`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${kvToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ value: JSON.stringify(session) }),
              });
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
