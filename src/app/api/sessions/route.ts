import { NextResponse } from "next/server";
import { kvGet, kvKeys } from "../../lib/kv";

export async function GET() {
  try {
    // Try KV first (works on Vercel and local with .env.local)
    const keys = await kvKeys("session:*");
    const sessions: any[] = [];

    for (const key of keys) {
      const data = await kvGet(key);
      if (data) {
        sessions.push({
          id: data.session_id || key.replace("session:", ""),
          model: data.model || "?",
          platform: data.platform || "?",
          start: data.session_start || "",
          updated: data.last_updated || "",
          preview: (data.system_prompt || "").slice(0, 80) + "...",
        });
      }
    }

    // Also try local filesystem (WSL fallback)
    try {
      const home = process.env.HOME || "/home/adminmac";
      const { execSync } = await import("child_process");
      const out = execSync(
        `ls -t ${home}/.hermes/sessions/session_*.json 2>/dev/null | head -50`,
        { timeout: 5000, encoding: "utf-8" }
      );
      const files = out.trim().split("\n").filter(Boolean);
      for (const f of files) {
        const id = f.match(/session_(.+)\.json$/)?.[1];
        if (id && !sessions.some((s: any) => s.id === id)) {
          try {
            const data = JSON.parse(execSync(`cat "${f}"`, { timeout: 3000, encoding: "utf-8" }));
            sessions.push({
              id: data.session_id || id,
              model: data.model || "?",
              platform: data.platform || "?",
              start: data.session_start || "",
              updated: data.last_updated || "",
              preview: (data.system_prompt || "").slice(0, 80) + "...",
            });
          } catch {}
        }
      }
    } catch {}

    // Sort by start date, newest first
    sessions.sort((a, b) => (b.start || "").localeCompare(a.start || ""));

    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ sessions: [], error: String(err) });
  }
}
