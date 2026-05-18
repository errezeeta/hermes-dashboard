"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Message {
  role: string;
  content: string;
}

interface SessionData {
  id: string;
  model: string;
  platform: string;
  start: string;
  updated: string;
  system_prompt: string;
  messages: Message[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params?.id as string;
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(d => { setSession(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div className="card" style={{ padding: "var(--s-4)" }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div className="card" style={{ padding: "var(--s-4)" }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-4)" }}>
        <a href="/sessions" style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-accent)", textDecoration: "none" }}>&larr; Sessions</a>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginTop: "var(--s-2)", marginBottom: "var(--s-1)" }}>
          {session.platform} · {session.model}
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
          {session.start ? new Date(session.start).toLocaleString() : ""}
        </div>
      </div>

      {session.system_prompt && (
        <div className="card" style={{ padding: "var(--s-3)", marginBottom: "var(--s-4)" }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-1)" }}>
            System Prompt
          </div>
          <pre style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-text-muted)", lineHeight: 1.4, whiteSpace: "pre-wrap", margin: 0 }}>
            {session.system_prompt}
          </pre>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
        {session.messages?.map((msg, i) => (
          <div key={i} className="card" style={{
            padding: "var(--s-3)",
            borderLeft: `2px solid ${msg.role === "user" ? "var(--color-accent)" : "var(--color-cyan)"}`,
          }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: msg.role === "user" ? "var(--color-accent)" : "var(--color-cyan)", marginBottom: "var(--s-1)" }}>
              {msg.role}
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {msg.content || "(no content)"}
            </div>
          </div>
        ))}
      </div>

      {(!session.messages || session.messages.length === 0) && (
        <div className="card" style={{ padding: "var(--s-4)" }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>No messages</p>
        </div>
      )}
    </div>
  );
}
