import { NextResponse } from "next/server";
import { runPython } from "@/lib/python";

export async function GET() {
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (kvUrl && kvToken) {
      const res = await fetch(`${kvUrl}/get/dashboard:health`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await res.json();
      if (data?.result) {
        const parsed = JSON.parse(data.result);
        if (parsed?.value) {
          return NextResponse.json(JSON.parse(parsed.value));
        }
        return NextResponse.json(parsed);
      }
    }

    const home = process.env.HOME || "/home/adminmac";
    const out = await runPython(
      `${home}/.hermes/scripts/dashboard-health.py`,
      "",
      10000
    );
    return NextResponse.json(JSON.parse(out));
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
