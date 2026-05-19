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

function formatBytes(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / 1048576).toFixed(1)}MB`;
}

const MODELS: Record<string, string> = {
  "deepseek-v4-flash": "DSK-4F",
  "gpt-5.2-codex": "GPT-5CX",
  "gpt-4o": "GPT-4Ω",
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [scanning, setScanning] = useState(true);

  const loadSessions = () => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(loadSessions, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setScanning(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

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
      if (data.id) router.push(`/sessions/${data.id}`);
    } catch {}
    setCreating(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      {/* Hacker Header */}
      <div className="fade-in" style={{ marginBottom: "var(--s-4)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--s-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", marginBottom: "var(--s-1)" }}>
          <span style={{ color: "var(--color-accent)", fontFamily: "'VT323', monospace", fontSize: "0.65rem" }}>$</span>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>
            ./hermes --list-sessions
          </span>
          {scanning && (
            <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", color: "var(--color-text-muted)", animation: "blink 0.8s step-end infinite" }}>▌</span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--s-3)" }}>
          <div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "1.3rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
              SESSION_LOG
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
              {loading ? "SCANNING..." : `${sessions.length} RECORDS FOUND`}
            </div>
          </div>
          <div style={{
            fontFamily: "'VT323', monospace", fontSize: "0.6rem", color: "var(--color-accent)",
            padding: "4px 10px", border: "1px solid var(--color-border)", borderRadius: "var(--r-sm)"
          }}>
            <span style={{ color: "var(--color-success)" }}>●</span> SYSTEM.ONLINE
          </div>
        </div>
      </div>

      {/* New Session - Terminal Input */}
      <div className="card" style={{
        padding: "var(--s-3)", marginBottom: "var(--s-4)",
        borderLeft: "2px solid var(--color-accent)",
        background: "linear-gradient(90deg, rgba(51,255,51,0.03), transparent)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", marginBottom: "var(--s-2)" }}>
          <span style={{ color: "var(--color-accent)", fontFamily: "'VT323', monospace", fontSize: "0.7rem" }}>$</span>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            INITIATE_CONNECTION
          </span>
        </div>
        <div style={{ display: "flex", gap: "var(--s-2)" }}>
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createSession()}
            placeholder="type your message..."
            style={{
              flex: 1,
              background: "var(--color-code-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--r-sm)",
              padding: "8px 12px",
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
            style={{ padding: "8px 16px", fontSize: "0.65rem", whiteSpace: "nowrap" }}
          >
            {creating ? "CONNECTING..." : "SEND"}
          </button>
        </div>
      </div>

      {/* Session List - Terminal Table */}
      {sessions.length > 0 ? (
        <div style={{ fontFamily: "'VT323', monospace", border: "1px solid var(--color-border)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
          {/* Header Row */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 100px 80px",
            padding: "6px 12px",
            borderBottom: "1px solid var(--color-border)",
            background: "rgba(51,255,51,0.03)",
            fontFamily: "'VT323', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}>
            <span>SOURCE</span>
            <span style={{ textAlign: "right" }}>MODEL</span>
            <span style={{ textAlign: "right" }}>DATE</span>
          </div>

          {sessions.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => router.push(`/sessions/${s.id}`)}
              style={{
                display: "grid", gridTemplateColumns: "1fr 100px 80px",
                padding: "8px 12px",
                borderBottom: idx < sessions.length - 1 ? "1px solid var(--color-border)" : "none",
                cursor: "pointer",
                transition: "all var(--t-fast)",
                background: idx % 2 === 0 ? "transparent" : "rgba(51,255,51,0.015)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(51,255,51,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(51,255,51,0.015)")}
            >
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.75rem", color: "var(--color-text-primary)" }}>
                <span style={{ color: "var(--color-accent)", marginRight: "var(--s-1)" }}>$</span>
                {s.preview.replace(/\.\.\.$/, "") || "new connection"}
                <span style={{ color: "var(--color-text-faint)", marginLeft: "4px" }}>...</span>
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--color-accent)", textAlign: "right" }}>
                {MODELS[s.model] || s.model.slice(0, 8)}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textAlign: "right" }}>
                {s.start ? new Date(s.start).toLocaleDateString() : "--"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div style={{
            fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)",
            textAlign: "center", padding: "var(--s-12) var(--s-4)",
            border: "1px dashed var(--color-border)", borderRadius: "var(--r-sm)"
          }}>
            [ NO SESSIONS FOUND ]
            <div style={{ marginTop: "var(--s-2)", fontSize: "0.65rem", color: "var(--color-text-faint)" }}>
              INITIATE A NEW CONNECTION ABOVE
            </div>
          </div>
        )
      )}

      {loading && (
        <div style={{
          fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)",
          textAlign: "center", padding: "var(--s-8)"
        }}>
          SCANNING SESSIONS... <span style={{ animation: "blink 0.8s step-end infinite" }}>▌</span>
        </div>
      )}

      {/* Hacker footer */}
      <div style={{
        marginTop: "var(--s-4)", padding: "var(--s-3)",
        fontFamily: "'VT323', monospace", fontSize: "0.55rem",
        color: "var(--color-text-faint)", textAlign: "center",
        borderTop: "1px solid var(--color-border)",
        letterSpacing: "0.1em", textTransform: "uppercase",
      }}>
        {sessions.length > 0
          ? `END OF LOG · ${sessions.length} RECORDS · ${new Date().toLocaleDateString()}`
          : "AWAITING INPUT"}
      </div>
    </div>
  );
}
