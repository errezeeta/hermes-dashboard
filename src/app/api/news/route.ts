import { NextResponse } from "next/server";
import { runPython } from "@/lib/python";

export async function GET() {
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (kvUrl && kvToken) {
      const res = await fetch(`${kvUrl}/get/dashboard:news`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await res.json();
      if (data?.result) {
        return NextResponse.json(JSON.parse(data.result));
      }
    }

    const home = process.env.HOME || "/home/adminmac";
    const out = await runPython(
      `${home}/.hermes/scripts/dashboard-news.py`,
      "",
      15000
    );
    return NextResponse.json(JSON.parse(out));
  } catch (err) {
    return NextResponse.json({ articles: [], total: 0, error: String(err) });
  }
}
