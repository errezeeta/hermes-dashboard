import { NextResponse } from "next/server";

export async function GET() {
  try {
    const home = process.env.HOME || "/home/adminmac";
    const { execSync } = await import("child_process");

    const env = {
      ...process.env,
      KV_REST_API_URL: process.env.KV_REST_API_URL || "",
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",
    };

    const out = execSync(
      `python3 ${home}/.hermes/scripts/dashboard-sessions.py`,
      { timeout: 10000, encoding: "utf-8", env }
    );
    const data = JSON.parse(out.trim());
    return NextResponse.json({ sessions: data || [] });
  } catch (err) {
    return NextResponse.json({ sessions: [], error: String(err) });
  }
}
