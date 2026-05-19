import { NextResponse } from "next/server";

// Get GitHub token from env or local gh CLI
async function getGitHubToken(): Promise<string> {
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  if (envToken) return envToken;

  // Try local gh CLI (works in dev/wsl)
  try {
    const { execSync } = await import("child_process");
    const token = execSync("gh auth token", { timeout: 5000, encoding: "utf-8" }).trim();
    if (token) return token;
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
    const home = process.env.HOME || "/home/adminmac";
    const { execSync } = await import("child_process");
    const out = execSync(
      `python3 ${home}/.hermes/scripts/dashboard-sessions.py ${id}`,
      { timeout: 10000, encoding: "utf-8" }
    );
    const session = JSON.parse(out.trim());
    if (!session) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    // Use session's own endpoint by default
    let apiBaseUrl = session.base_url || "https://api.openai.com/v1";
    let model = session.model || "gpt-4o";

    // If using opencode, force their endpoint and pick an available model
    if (apiBaseUrl.includes("opencode")) {
      apiBaseUrl = "https://opencode.ai/zen/go/v1";
      model = "gpt-5.2-codex";
    }

    // Get auth token: GitHub token (for OpenCode) or OpenAI key
    const ghToken = await getGitHubToken();
    const openaiKey = process.env.OPENAI_API_KEY || "";

    let apiKey = "";

    // Determine which auth to use
    if (apiBaseUrl.includes("opencode")) {
      apiKey = ghToken;
      if (!apiKey) {
        apiKey = process.env.OPENCODE_KEY || openaiKey;
        if (apiKey) apiBaseUrl = "https://api.openai.com/v1";
      }
    } else {
      apiKey = openaiKey;
    }

    if (!apiKey) {
      return NextResponse.json({
        error: "No API key available. In Vercel: set GITHUB_TOKEN (GitHub PAT) or OPENAI_API_KEY. Locally: gh auth login."
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

    // Call API
    const res = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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

    // Stream response
    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "no stream" }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
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
                  controller.enqueue(encoder.encode(JSON.stringify({ content }) + "\n"));
                }
              } catch {}
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
