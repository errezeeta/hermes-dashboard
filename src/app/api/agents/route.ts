import { NextResponse } from "next/server";
import { readTextFile } from "@/lib/python";

export async function GET() {
  try {
    const log = await readTextFile(process.env.HOME + "/.hermes/logs/gateway.log");
    const lines = log.split("\n").filter(Boolean).reverse().slice(0, 30);

    const agents = lines
      .filter((l) => l.includes("cron") || l.includes("Scanner") || l.includes("News") || l.includes("Fit"))
      .map((l) => {
        const ts = l.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1] || "";
        return { timestamp: ts, line: l };
      })
      .slice(0, 10);

    const cronLines = log
      .split("\n")
      .filter((l) => l.includes("cron") || l.includes("Tiburon") || l.includes("News") || l.includes("Fit"))
      .reverse()
      .slice(0, 8)
      .map((l) => {
        const ts = l.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1] || "";
        const isWarn = l.includes("WARN") || l.includes("error");
        const type = isWarn ? "warning" : "info";
        return {
          timestamp: ts,
          agent: l.includes("Tiburon") || l.includes("tiburon") ? "🦈 Tiburón" : l.includes("News") ? "☝️🤓 News" : l.includes("Fit") ? "💪 JordiWild" : "🤖 System",
          message: l.split(": ").slice(2).join(": ") || l.slice(30),
          type: type as "info" | "warning",
        };
      });

    return NextResponse.json({
      agents: [
        { name: "Tiburón", emoji: "🦈", status: "online", lastRun: "15 min", nextRun: "cron */15min" },
        { name: "JordiWild", emoji: "💪", status: "idle", lastRun: "20:00", nextRun: "cron 20:00" },
        { name: "News", emoji: "☝️🤓", status: "idle", lastRun: "08:00", nextRun: "cron 08:00" },
      ],
      logs: cronLines,
    });
  } catch (err) {
    return NextResponse.json({ agents: [], logs: [], error: String(err) });
  }
}
