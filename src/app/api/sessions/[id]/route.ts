import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const home = process.env.HOME || "/home/adminmac";
    const { execSync } = await import("child_process");

    // Pass KV env vars so the Python script can read from KV
    const env = {
      ...process.env,
      KV_REST_API_URL: process.env.KV_REST_API_URL || "",
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",
    };

    const out = execSync(
      `python3 ${home}/.hermes/scripts/dashboard-sessions.py ${id}`,
      { timeout: 10000, encoding: "utf-8", env }
    );
    const data = JSON.parse(out.trim());
    if (!data) {
      return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(null, { status: 404 });
  }
}
