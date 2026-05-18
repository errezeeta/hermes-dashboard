import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const home = process.env.HOME || "/home/adminmac";
    const { execSync } = await import("child_process");
    const out = execSync(
      `python3 ${home}/.hermes/scripts/dashboard-sessions.py ${id}`,
      { timeout: 10000, encoding: "utf-8" }
    );
    return NextResponse.json(JSON.parse(out.trim()));
  } catch (err) {
    return NextResponse.json(null, { status: 404 });
  }
}
