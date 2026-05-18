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
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--s-8)" }}>
      <div className="card" style={{ width: "min(420px, 90vw)", position: "relative" }}>
        <div className="badge badge--amber" style={{ marginBottom: "var(--s-4)" }}>Access Node</div>
        <h1 className="glitch" data-text="Hermes Access" style={{ fontFamily: "'VT323', monospace", fontSize: "1.6rem", margin: 0 }}>
          Hermes Access
        </h1>
        <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "var(--s-2)" }}>
          Authenticate to enter the console.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "var(--s-6)", display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)", fontFamily: "'VT323', monospace", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
            User
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                background: "var(--color-code-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--r-sm)",
                color: "var(--color-text-primary)",
                fontFamily: "'VT323', monospace",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)", fontFamily: "'VT323', monospace", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
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
              }}
            />
          </label>

          {error && (
            <div style={{ color: "var(--color-danger)", fontFamily: "'VT323', monospace", fontSize: "0.8rem" }}>
              {error}
            </div>
          )}

          <button className="btn-amber" type="submit" disabled={loading}>
            {loading ? "Connecting..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
