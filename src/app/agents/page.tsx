"use client";

import { useEffect, useState } from "react";

interface SystemData {
  cron_text?: string;
  cron_lines?: string[];
  error?: string;
}

export default function AgentsPage() {
  const [data, setData] = useState<SystemData | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(setData);
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-6)" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "var(--s-1)" }}>
          System
        </div>
        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Agents
        </div>
      </div>

      <div className="card" style={{ padding: "var(--s-4)" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "var(--s-3)" }}>
          Agent Status
        </div>
        <pre style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", color: "var(--color-text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
          {data ? JSON.stringify(data, null, 2) : "loading..."}
        </pre>
      </div>
    </div>
  );
}
