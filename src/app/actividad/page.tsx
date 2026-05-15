"use client";

import { useEffect, useState } from "react";

interface ActivityLog {
  timestamp: string;
  agent: string;
  message: string;
  type: string;
}

interface ActivityData {
  agents: { name: string; emoji: string; status: string; lastRun: string; nextRun: string }[];
  logs: ActivityLog[];
}

const agentMeta: Record<string, { label: string; accent: string }> = {
  "🦈 Tiburón": { label: "TIBURÓN", accent: "var(--color-amber)" },
  "💪 JordiWild": { label: "JORDIWILD", accent: "var(--color-success)" },
  "☝️🤓 News": { label: "NEWS", accent: "var(--color-gold)" },
  "🤖 System": { label: "SYSTEM", accent: "var(--color-text-muted)" },
};

export default function ActividadPage() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-12)" }}>
        <div className="step-label" style={{ marginBottom: "var(--s-3)" }}>System</div>
        <h1 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
          Agent Activity
        </h1>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "var(--s-2)" }}>
          Gateway logs and agent status.
        </p>
      </div>

      {/* Agent Status */}
      <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--s-4)", marginBottom: "var(--s-12)" }}>
        {data?.agents.map((agent) => {
          const meta = agentMeta[agent.name] ?? agentMeta["🤖 System"];
          return (
            <div key={agent.name} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)", marginBottom: "var(--s-3)" }}>
                <span className={`status-dot ${agent.status === "online" ? "status-dot--online" : "status-dot--idle"}`}></span>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                <div>last: {agent.lastRun}</div>
                <div>next: {agent.nextRun}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs */}
      <div className="card fade-in">
        <div className="step-label" style={{ marginBottom: "var(--s-4)" }}>Log Stream</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
          {data?.logs && data.logs.length > 0 ? (
            data.logs.map((log, i) => {
              const meta = agentMeta[log.agent] ?? agentMeta["🤖 System"];
              return (
                <div key={i} style={{ display: "flex", gap: "var(--s-3)", padding: "var(--s-1) 0", borderBottom: "1px solid var(--color-border)", opacity: 1 - (i * 0.03) }}>
                  <span style={{ color: "var(--color-text-faint)", flexShrink: 0, minWidth: "140px" }}>
                    {log.timestamp}
                  </span>
                  <span style={{ color: meta.accent, flexShrink: 0, minWidth: "80px" }}>
                    [{meta.label}]
                  </span>
                  <span style={{ color: "var(--color-text-primary)", overflowWrap: "break-word" }}>
                    {log.message}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "var(--s-8)", textAlign: "center" }}>No recent logs</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>loading activity...</span>
    </div>
  );
}
