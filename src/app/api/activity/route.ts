import { NextResponse } from "next/server";
import { readTextFile } from "@/lib/python";

export async function GET() {
  try {
    const home = process.env.HOME || "/home/adminmac";
    const log = await readTextFile(`${home}/.hermes/logs/gateway.log`);
    const lines = log.split("\n").filter(Boolean).reverse();

    const entries = [];
    for (const line of lines.slice(0, 50)) {
      if (line.includes("cron") || line.includes("Tiburon") || line.includes("News") || line.includes("Fit") || line.includes("inbound") || line.includes("response ready")) {
        const ts = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1] || "";
        const isWarn = line.includes("WARN") || line.includes("error");
        const isError = line.includes("ERROR");
        let agent = "🤖 System";
        if (line.includes("Tiburon") || line.includes("tiburon") || line.includes("polymarket")) agent = "🦈 Tiburón";
        else if (line.includes("News") || line.includes("news") || line.includes("blog")) agent = "☝️🤓 News";
        else if (line.includes("Fit") || line.includes("health") || line.includes("pasos")) agent = "💪 JordiWild";

        entries.push({
          timestamp: ts,
          agent,
          message: line.split(": ").slice(3).join(": ") || line.slice(25),
          type: isError ? "error" as const : isWarn ? "warning" as const : "info" as const,
        });
      }
    }

    return NextResponse.json({
      agents: [
        { name: "Tiburón", emoji: "🦈", status: "online", lastRun: "cron */15min", nextRun: "cron */15min" },
        { name: "JordiWild", emoji: "💪", status: "idle", lastRun: "cron 20:00", nextRun: "cron 20:00" },
        { name: "News", emoji: "☝️🤓", status: "idle", lastRun: "cron 08:00", nextRun: "cron 08:00" },
      ],
      logs: entries.slice(0, 25),
    });
  } catch (err) {
    return NextResponse.json({ agents: [], logs: [], error: String(err) });
  }
}
