import { NextResponse } from "next/server";
import { runPython } from "@/lib/python";

export async function GET() {
  try {
    const home = process.env.HOME || "/home/adminmac";
    const out = await runPython(`${home}/.hermes/scripts/dashboard-sessions.py`, "", 10000);
    const sessions = JSON.parse(out);
    return NextResponse.json({ sessions });
  } catch (err) {
    return NextResponse.json({ sessions: [], error: String(err) });
  }
}
