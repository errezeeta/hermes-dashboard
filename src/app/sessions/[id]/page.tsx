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
        setStreamContent(`[ERROR] ${err.error}`);
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
      setStreamContent(`[FATAL] ${err.message}`);
    }
    setStreaming(false);
    setStreamContent("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{
          fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)",
          padding: "var(--s-8)", textAlign: "center"
        }}>
          CONNECTING TO SESSION... <span style={{ animation: "blink 0.8s step-end infinite" }}>▌</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div className="card" style={{ padding: "var(--s-4)", borderLeft: "2px solid var(--color-danger)" }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-danger)" }}>[ SESSION NOT FOUND ]</div>
          <a href="/sessions" style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-accent)", textDecoration: "none", marginTop: "var(--s-2)", display: "block" }}>&larr; RETURN</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{
      maxWidth: "960px", margin: "0 auto",
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 40px)"
    }}>
      {/* Terminal Header */}
      <div className="fade-in" style={{
        flexShrink: 0, marginBottom: "var(--s-3)",
        borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--s-3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", marginBottom: "var(--s-1)" }}>
          <span style={{ color: "var(--color-accent)", fontFamily: "'VT323', monospace", fontSize: "0.65rem" }}>$</span>
          <a href="/sessions" style={{
            fontFamily: "'VT323', monospace", fontSize: "0.65rem",
            color: "var(--color-accent)", textDecoration: "none", letterSpacing: "0.05em"
          }}>
            ../sessions
          </a>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", color: "var(--color-text-faint)" }}>/</span>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
            {session.id.slice(0, 20)}...
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--s-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: "0.6rem",
              padding: "2px 8px", border: "1px solid var(--color-accent)", borderRadius: "var(--r-sm)",
              color: "var(--color-accent)"
            }}>
              {session.platform?.toUpperCase() || "CLI"}
            </span>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
              MODEL: {session.model}
            </span>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
              MSGS: {localMessages.length}
            </span>
          </div>
          <span style={{
            fontFamily: "'VT323', monospace", fontSize: "0.6rem",
            padding: "2px 8px", background: "rgba(51,255,51,0.05)", borderRadius: "var(--r-sm)",
            color: streaming ? "var(--color-warning)" : "var(--color-success)"
          }}>
            {streaming ? "● STREAMING" : "● IDLE"}
          </span>
        </div>
      </div>

      {/* Messages - Terminal Scroll */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--s-2)",
        marginBottom: "var(--s-3)", paddingRight: "4px"
      }}>
        {localMessages.length === 0 && !streamContent && (
          <div style={{
            fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-text-faint)",
            textAlign: "center", padding: "var(--s-8)"
          }}>
            [ EMPTY CHANNEL ]
            <div style={{ marginTop: "var(--s-2)", fontSize: "0.6rem" }}>TYPE A MESSAGE TO BEGIN</div>
          </div>
        )}

        {localMessages.map((msg, i) => (
          <div key={i} style={{
            padding: "var(--s-2) var(--s-3)",
            borderLeft: `2px solid ${msg.role === "user" ? "var(--color-accent)" : "var(--color-cyan)"}`,
            fontFamily: "'VT323', monospace",
            background: msg.role === "user"
              ? "rgba(51,255,51,0.02)"
              : "rgba(255,51,102,0.02)",
          }}>
            <div style={{
              fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: msg.role === "user" ? "var(--color-accent)" : "var(--color-cyan)",
              marginBottom: "2px"
            }}>
              {msg.role === "user" ? "$ USER :: INPUT" : "→ AGENT :: RESPONSE"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {msg.content || "(null)"}
            </div>
          </div>
        ))}

        {streamContent && (
          <div style={{
            padding: "var(--s-2) var(--s-3)",
            borderLeft: "2px solid var(--color-cyan)",
            fontFamily: "'VT323', monospace",
            background: "rgba(255,51,102,0.02)",
          }}>
            <div style={{
              fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--color-cyan)", marginBottom: "2px"
            }}>
              → AGENT :: STREAMING
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {streamContent}
              <span style={{ animation: "blink 0.8s step-end infinite", color: "var(--color-accent)" }}>▌</span>
            </div>
          </div>
        )}

        <div ref={chatEnd} />
      </div>

      {/* Terminal Input */}
      <div style={{
        flexShrink: 0,
        borderTop: "1px solid var(--color-border)",
        paddingTop: "var(--s-3)", paddingBottom: "var(--s-3)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--s-2)",
          padding: "8px 12px",
          background: "var(--color-code-bg)",
          border: `1px solid ${streaming ? "var(--color-warning)" : "var(--color-border)"}`,
          borderRadius: "var(--r-sm)",
          transition: "border-color 0.2s ease",
        }}>
          <span style={{
            fontFamily: "'VT323', monospace", fontSize: "0.8rem",
            color: streaming ? "var(--color-warning)" : "var(--color-accent)",
          }}>
            {streaming ? "..." : "$"}
          </span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={streaming ? "awaiting response..." : "type message..."}
            disabled={streaming}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              padding: "0",
              fontFamily: "'VT323', monospace",
              fontSize: "0.9rem",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            style={{
              background: "transparent",
              border: `1px solid ${input.trim() && !streaming ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: "var(--r-sm)",
              padding: "4px 12px",
              fontFamily: "'VT323', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              color: input.trim() && !streaming ? "var(--color-accent)" : "var(--color-text-faint)",
              cursor: input.trim() && !streaming ? "pointer" : "default",
              transition: "all var(--t-fast)",
              textTransform: "uppercase",
            }}
          >
            {streaming ? "..." : "SEND"}
          </button>
        </div>
        <div style={{
          fontFamily: "'VT323', monospace", fontSize: "0.5rem",
          color: "var(--color-text-faint)", marginTop: "4px",
          letterSpacing: "0.05em",
          paddingLeft: "4px",
        }}>
          CTRL+ENTER · {localMessages.length} MESSAGES · {session.id.slice(0, 12)}
        </div>
      </div>
    </div>
  );
}
