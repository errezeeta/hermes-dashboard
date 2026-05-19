import { NextResponse } from "next/server";
import { kvGet, kvSet } from "../../../../lib/kv";
import { execSync } from "child_process";

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
    // Load session from KV (Vercel) or local filesystem
    let session: any = await kvGet(`session:${id}`);
    let sessionLoaded = false;

    if (!session) {
      const home = process.env.HOME || "/home/adminmac";
      const out = execSync(
        `cat "${home}/.hermes/sessions/session_${id}.json" 2>/dev/null`,
        { timeout: 5000, encoding: "utf-8" }
      );
      if (out.trim()) {
        session = JSON.parse(out.trim());
        sessionLoaded = true;
      }
    } else {
      sessionLoaded = true;
    }

    if (!session) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    // Use Hermes CLI to continue the session - this handles auth automatically
    const { spawn } = await import("child_process");

    const response = await new Promise<string>((resolve, reject) => {
      const proc = spawn("hermes", [
        "chat",
        "-q", message,
        "--resume", id,
        "--quiet",
        "-Q",
      ], {
        timeout: 60000,
        env: { ...process.env, TERM: "dumb", PAGER: "cat" },
      });

      let output = "";
      let error = "";

      proc.stdout.on("data", (data: Buffer) => {
        output += data.toString();
      });

      proc.stderr.on("data", (data: Buffer) => {
        error += data.toString();
      });

      proc.on("close", (code: number) => {
        if (code === 0 && output.trim()) {
          resolve(output.trim());
        } else {
          reject(new Error(error || output || `exit code ${code}`));
        }
      });

      proc.on("error", reject);
    });

    // Save messages back to KV
    const fullContent = response;
    session.messages = session.messages || [];
    session.messages.push({ role: "user", content: message });
    session.messages.push({ role: "assistant", content: fullContent });
    session.last_updated = new Date().toISOString();

    await kvSet(`session:${id}`, session);

    // Also save locally
    try {
      const home = process.env.HOME || "/home/adminmac";
      const path = `${home}/.hermes/sessions/session_${id}.json`;
      const fs = await import("fs");
      fs.writeFileSync(path, JSON.stringify(session, null, 2));
    } catch {}

    // Return as SSE stream (even though we have the full response, stream it for UI feel)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming by sending chunks
        const words = fullContent.split(/(?<=\s)/);
        let i = 0;
        const send = () => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(JSON.stringify({ content: words[i] }) + "\n"));
            i++;
            setTimeout(send, 15);
          } else {
            controller.close();
          }
        };
        send();
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
