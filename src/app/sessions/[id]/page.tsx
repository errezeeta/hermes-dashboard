"use client";

import { useEffect, useState, useRef } from "react";
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
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(d => { setSession(d); setLocalMessages(d?.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, streamContent]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input };
    setLocalMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setStreamContent("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      if (!res.ok) {
        const err = await res.json();
        setStreamContent(`Error: ${err.error}`);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("no stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.content) {
              fullContent += json.content;
              setStreamContent(fullContent);
            }
          } catch {}
        }
      }

      if (fullContent) {
        setLocalMessages(prev => [...prev, { role: "assistant", content: fullContent }]);
      }
    } catch (err: any) {
      setStreamContent(`Error: ${err.message}`);
    }
    setStreaming(false);
    setStreamContent("");
  };

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
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 40px)" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-4)", flexShrink: 0 }}>
        <a href="/sessions" style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-accent)", textDecoration: "none" }}>&larr; Sessions</a>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginTop: "var(--s-2)", marginBottom: "var(--s-1)" }}>
          {session.platform} · {session.model}
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
          {session.start ? new Date(session.start).toLocaleString() : ""}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--s-3)", marginBottom: "var(--s-4)" }}>
        {localMessages.map((msg, i) => (
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

        {streamContent && (
          <div className="card" style={{
            padding: "var(--s-3)",
            borderLeft: "2px solid var(--color-cyan)",
          }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cyan)", marginBottom: "var(--s-1)" }}>
              assistant <span style={{ color: "var(--color-text-muted)", fontSize: "0.55rem" }}>streaming...</span>
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {streamContent}
              <span className="stream-cursor" style={{ animation: "blink 0.8s step-end infinite" }}>▌</span>
            </div>
          </div>
        )}

        <div ref={chatEnd} />
      </div>

      <div style={{ flexShrink: 0, paddingBottom: "var(--s-4)" }}>
        <div className="card" style={{ padding: "var(--s-3)", display: "flex", gap: "var(--s-2)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder={streaming ? "waiting for response..." : "write to session..."}
            disabled={streaming}
            style={{
              flex: 1,
              background: "var(--color-code-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--r-sm)",
              padding: "var(--s-2) var(--s-3)",
              fontFamily: "'VT323', monospace",
              fontSize: "0.8rem",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <button
            className="btn-amber"
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            style={{ padding: "var(--s-2) var(--s-4)", fontSize: "0.7rem", whiteSpace: "nowrap" }}
          >
            {streaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
