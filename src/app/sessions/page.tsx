"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionSummary {
  id: string;
  model: string;
  platform: string;
  start: string;
  updated: string;
  preview: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const loadSessions = () => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(loadSessions, []);

  const createSession = async () => {
    if (!newMsg.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/sessions/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMsg.trim() }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/sessions/${data.id}`);
      }
    } catch {}
    setCreating(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--s-3)" }}>
          <div>
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
        </div>
      </div>

      {/* New Session */}
      <div className="card fade-in" style={{ padding: "var(--s-3)", marginBottom: "var(--s-6)" }}>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-2)" }}>
          New Session
        </div>
        <div style={{ display: "flex", gap: "var(--s-2)" }}>
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createSession()}
            placeholder="start a new conversation..."
            style={{
              flex: 1,
              background: "var(--color-code-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--r-sm)",
              padding: "var(--s-2) var(--s-3)",
              fontFamily: "'VT323', monospace",
              fontSize: "0.85rem",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <button
            className="btn-amber"
            onClick={createSession}
            disabled={creating || !newMsg.trim()}
            style={{ padding: "var(--s-2) var(--s-4)", fontSize: "0.7rem", whiteSpace: "nowrap" }}
          >
            {creating ? "..." : "Create"}
          </button>
        </div>
      </div>

      {/* Session List */}
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
