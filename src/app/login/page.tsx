"use client";

import { useState } from "react";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Access denied");
      return;
    }

    window.location.href = "/";
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--s-8)",
      padding: "var(--s-6)",
    }}>
      {/* Big glitch title */}
      <div style={{ textAlign: "center" }}>
        <div
          className="glitch"
          data-text="Marlonbot 0.1"
          style={{
            fontFamily: "'Jacquard 12', monospace",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            color: "var(--color-text-primary)",
            letterSpacing: "0.04em",
            lineHeight: 1.15,
          }}
        >
          Marlonbot 0.1
        </div>
        <p style={{
          fontFamily: "'VT323', monospace",
          fontSize: "0.9rem",
          color: "var(--color-text-muted)",
          marginTop: "var(--s-2)",
        }}>
          Multi-agent ecosystem control panel
        </p>
      </div>

      {/* Login card */}
      <div className="card" style={{ width: "min(380px, 90vw)", position: "relative", padding: "var(--s-6)" }}>
        <div style={{
          fontFamily: "'VT323', monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          marginBottom: "var(--s-4)",
          textAlign: "center",
        }}>
          Authenticate
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
          <label style={{
            display: "flex", flexDirection: "column", gap: "var(--s-2)",
            fontFamily: "'VT323', monospace", fontSize: "0.75rem",
            textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)",
          }}>
            User
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              autoFocus
              style={{
                padding: "10px 12px",
                background: "var(--color-code-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--r-sm)",
                color: "var(--color-text-primary)",
                fontFamily: "'VT323', monospace",
                fontSize: "0.9rem",
              }}
            />
          </label>

          <label style={{
            display: "flex", flexDirection: "column", gap: "var(--s-2)",
            fontFamily: "'VT323', monospace", fontSize: "0.75rem",
            textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)",
          }}>
            Pass
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                background: "var(--color-code-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--r-sm)",
                color: "var(--color-text-primary)",
                fontFamily: "'VT323', monospace",
                fontSize: "0.9rem",
              }}
            />
          </label>

          {error && (
            <div style={{ color: "var(--color-danger)", fontFamily: "'VT323', monospace", fontSize: "0.8rem", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button className="btn-amber" type="submit" disabled={loading} style={{ marginTop: "var(--s-2)", justifyContent: "center" }}>
            {loading ? "Connecting..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
