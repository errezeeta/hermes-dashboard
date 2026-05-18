"use client";

import { useEffect, useState } from "react";

interface AgentInfo {
  name: string;
  emoji: string;
  status: string;
  lastRun: string;
  nextRun: string;
}

interface LogEntry {
  timestamp: string;
  agent: string;
  message: string;
  type: "info" | "warning";
}

interface AgentsAPIResponse {
  agents?: AgentInfo[];
  logs?: LogEntry[];
}

export default function AgentsPage() {
  const [data, setData] = useState<AgentsAPIResponse | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(setData);
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-6)" }}>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "var(--s-1)" }}>
          System
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Agents
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "var(--s-1)" }}>
          {data?.agents?.length ?? "..."} active
        </div>
      </div>

      {/* Agent Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
        {data?.agents?.map((agent) => (
          <div key={agent.name} className="card fade-in" style={{ padding: "var(--s-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", marginBottom: "var(--s-3)" }}>
              <span style={{ fontSize: "1.2rem" }}>{agent.emoji}</span>
              <div>
                <div style={{ fontFamily: "'VT323', monospace", fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                  {agent.name}
                </div>
              </div>
              <span className="status-dot" style={{
                width: 8, height: 8,
                marginLeft: "auto",
                background: agent.status === "online" ? "var(--color-success)" : "var(--color-text-muted)",
                boxShadow: agent.status === "online" ? "0 0 6px rgba(74,154,74,0.5)" : "none"
              }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-2)" }}>
              <div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Status
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: agent.status === "online" ? "var(--color-success)" : "var(--color-text-muted)" }}>
                  {agent.status}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Last Run
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-primary)" }}>
                  {agent.lastRun}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Log */}
      <div className="card fade-in" style={{ padding: "var(--s-4)" }}>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "var(--s-3)" }}>
          Activity Log
        </div>
        {data?.logs && data.logs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {data.logs.map((log, i) => (
              <div key={i} style={{
                display: "flex",
                gap: "var(--s-2)",
                padding: "4px 8px",
                fontFamily: "'VT323', monospace",
                fontSize: "0.65rem",
                background: log.type === "warning" ? "rgba(211,155,42,0.05)" : "transparent",
                borderLeft: log.type === "warning" ? "2px solid var(--color-warning)" : "2px solid transparent",
                borderBottom: "1px solid var(--color-border)",
              }}>
                <span style={{ color: "var(--color-text-faint)", flexShrink: 0 }}>
                  {log.timestamp || "--"}
                </span>
                <span style={{ color: log.type === "warning" ? "var(--color-warning)" : "var(--color-text-muted)", flexShrink: 0 }}>
                  {log.agent}
                </span>
                <span style={{ color: "var(--color-text-primary)" }}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}
