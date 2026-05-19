import { NextResponse } from "next/server";

// Try multiple env var names for API key
function getApiKey(): string {
  return process.env.OPENAI_API_KEY
    || process.env.OPENAI_KEY
    || process.env.AI_API_KEY
    || process.env.LLM_API_KEY
    || "";
}

function getBaseUrl(): string {
  return process.env.OPENAI_BASE_URL
    || process.env.AI_BASE_URL
    || "https://api.openai.com/v1";
}

function getModel(): string {
  return process.env.AI_MODEL || "gpt-4o";
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

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({
        error: "No API key configured. Set OPENAI_API_KEY in Vercel env vars."
      }, { status: 500 });
    }

    const baseUrl = getBaseUrl();
    const model = getModel();

    // Build messages array
    const messages = [
      { role: "system", content: session.system_prompt || "You are a helpful assistant." },
      ...(session.messages || []).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call model API
    const res = await fetch(`${baseUrl}/chat/completions`, {
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

    // Stream the response back
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
