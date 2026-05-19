import { NextResponse } from "next/server";
import { kvGet } from "../../../lib/kv";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Try KV first
    const data = await kvGet(`session:${id}`);
    if (data) {
      return NextResponse.json(formatSession(data));
    }

    // Try local filesystem fallback
    const home = process.env.HOME || "/home/adminmac";
    const { execSync } = await import("child_process");
    const path = `${home}/.hermes/sessions/session_${id}.json`;
    const out = execSync(`cat "${path}" 2>/dev/null`, { timeout: 5000, encoding: "utf-8" });
    if (out.trim()) {
      const data = JSON.parse(out.trim());
      return NextResponse.json(formatSession(data));
    }

    return NextResponse.json(null, { status: 404 });
  } catch {
    return NextResponse.json(null, { status: 404 });
  }
}

function formatSession(data: any) {
  const messages = (data.messages || []).map((m: any) => ({
    role: m.role,
    content: typeof m.content === "string" ? m.content.slice(0, 500) : "",
  }));
  return {
    id: data.session_id || "",
    model: data.model || "?",
    platform: data.platform || "?",
    base_url: data.base_url || "",
    start: data.session_start || "",
    updated: data.last_updated || "",
    system_prompt: (data.system_prompt || "").slice(0, 200),
    messages,
  };
}
