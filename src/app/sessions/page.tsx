"use client";

import { useEffect, useState } from "react";

interface SessionSummary {
  id: string;
  model: string;
  platform: string;
  start: string;
  updated: string;
  preview: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-6)" }}>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "var(--s-1)" }}>
          System
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Sessions
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "var(--s-1)" }}>
          {loading ? "..." : `${sessions.length} sessions`}
        </div>
      </div>

      {sessions.map((s) => (
        <a key={s.id} href={`/sessions/${s.id}`} style={{ textDecoration: "none" }}>
          <div className="card fade-in" style={{ padding: "var(--s-3)", marginBottom: "var(--s-3)", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--s-1)" }}>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-accent)" }}>
                {s.platform} · {s.model}
              </div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
                {s.start ? new Date(s.start).toLocaleDateString() : "?"}
              </div>
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
              {s.preview || "No preview"}
            </div>
          </div>
        </a>
      ))}

      {!loading && sessions.length === 0 && (
        <div className="card" style={{ padding: "var(--s-4)" }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
            No sessions found
          </p>
        </div>
      )}
    </div>
  );
}
