"use client";

import { useEffect, useState } from "react";

interface PortfolioData {
  items: { ticker: string; quantity: number; avg_cost: number; current_price: number; value: number; pnl_pct: number }[];
  btc: { quantity: number; value: number; price: number };
  total_invested: number;
  total_current: number;
  total_pnl: number;
  total_pnl_pct: number;
}

interface HealthData {
  steps: { today: number; avg7d: number; avg30d: number; trend: string };
  weight: { current: number; avg7d: number; trend: string } | null;
  sleep: any;
}

interface NewsData {
  articles: { title: string; source: string; category: string }[];
  total: number;
}

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [system, setSystem] = useState<{ cron_text?: string } | null>(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return { mode: "dark", accent: "amber" };
    const stored = window.localStorage.getItem("hb-theme");
    if (!stored) return { mode: "dark", accent: "amber" };
    try {
      return JSON.parse(stored);
    } catch {
      return { mode: "dark", accent: "amber" };
    }
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/cartera").then(r => r.json()),
      fetch("/api/salud").then(r => r.json()),
      fetch("/api/news").then(r => r.json()),
      fetch("/api/agents").then(r => r.json()),
    ]).then(([p, h, n, s]) => {
      setPortfolio(p);
      setHealth(h);
      setNews(n);
      setSystem(s);
      setLoading(false);
    });

    const interval = setInterval(() => {
      fetch("/api/cartera").then(r => r.json()).then(setPortfolio);
      fetch("/api/salud").then(r => r.json()).then(setHealth);
      fetch("/api/news").then(r => r.json()).then(setNews);
      fetch("/api/agents").then(r => r.json()).then(setSystem);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-dark", "theme-light", "theme-amber", "theme-cyan");
    body.classList.add(`theme-${theme.mode}`, `theme-${theme.accent}`);
    window.localStorage.setItem("hb-theme", JSON.stringify(theme));
  }, [theme]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ color: "var(--color-text-muted)", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem" }}>
          initializing...
        </span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)" }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom: "var(--s-12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--s-6)", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "var(--s-3)" }}>
              System Status
            </div>
            <div className="glitch" data-text="MARLONBOT 0.1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(1rem, 2vw, 1.4rem)", color: "var(--color-text-primary)", letterSpacing: "0.08em", lineHeight: 1.3, margin: 0, textTransform: "uppercase" }}>
              Marlonbot 0.1
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.9rem", color: "var(--color-text-muted)", marginTop: "var(--s-2)", lineHeight: 1.6 }}>
              Multi-agent ecosystem control panel. Local-first. Noisy by design.
            </p>
            <div style={{ display: "flex", gap: "var(--s-3)", marginTop: "var(--s-4)", flexWrap: "wrap", alignItems: "center" }}>
              <a className="btn-amber" href="/cartera">Open Console</a>
              <a className="btn-amber" href="/actividad" style={{ borderColor: "var(--color-cyan)", color: "var(--color-cyan)" }}>Live Signal</a>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)", minWidth: "220px" }}>
            <div className="card" style={{ padding: "var(--s-4)" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                Theme
              </div>
              <div style={{ display: "flex", gap: "var(--s-2)", marginTop: "var(--s-3)" }}>
                <button
                  className="btn-amber"
                  type="button"
                  onClick={() => setTheme((t: any) => ({ ...t, mode: t.mode === "dark" ? "light" : "dark" }))}
                  style={{ fontSize: "0.7rem", padding: "8px 16px" }}
                >
                  {theme.mode === "dark" ? "Light" : "Dark"}
                </button>
                <button
                  className="btn-amber"
                  type="button"
                  onClick={() => setTheme((t: any) => ({ ...t, accent: t.accent === "amber" ? "cyan" : "amber" }))}
                  style={{ fontSize: "0.7rem", padding: "8px 16px", borderColor: "var(--color-cyan)", color: "var(--color-cyan)" }}
                >
                  {theme.accent === "amber" ? "Cyan" : "Amber"}
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: "var(--s-4)" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                Automations
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", color: "var(--color-text-primary)", marginTop: "var(--s-2)" }}>
                {system?.cron_text ? "active" : "loading"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--s-4)", marginBottom: "var(--s-12)" }}>
        <MetricCard label="CARTERA TOTAL" value={`€${portfolio?.total_current?.toFixed(2) ?? "0"}`} sub={portfolio?.total_pnl_pct != null ? `${portfolio.total_pnl >= 0 ? "+" : ""}${portfolio.total_pnl_pct}%` : undefined} positive={portfolio?.total_pnl != null && portfolio.total_pnl >= 0} delay={0} />
        <MetricCard label="PASOS HOY" value={health?.steps?.today?.toLocaleString() ?? "—"} sub={`media 7d: ${Math.round(health?.steps?.avg7d ?? 0).toLocaleString()}`} delay={80} />
        <MetricCard label="NOTICIAS" value={news?.total?.toString() ?? "0"} sub="artículos" delay={160} />
        <MetricCard label="BTC PRICE" value={portfolio?.btc?.price ? `€${portfolio.btc.price.toLocaleString()}` : "—"} sub={portfolio?.btc?.quantity ? `${portfolio.btc.quantity} BTC` : undefined} delay={240} />
      </div>

      {/* Portfolio + Health */}
      <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--s-4)", marginBottom: "var(--s-12)" }}>
        {/* Portfolio */}
        <div className="card" style={{ animationDelay: "80ms" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "var(--s-4)" }}>
            Tiburón — Portfolio
          </div>
          {portfolio?.items && portfolio.items.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
              {portfolio.items.map((item) => (
                <div key={item.ticker} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--s-2)", borderBottom: "1px solid var(--color-border)" }}>
                  <div>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 600, color: "var(--color-text-primary)" }}>{item.ticker}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "var(--s-2)" }}>{item.quantity}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>€{item.value.toFixed(2)}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", color: item.pnl_pct >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                      {item.pnl_pct >= 0 ? "+" : ""}{item.pnl_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>No positions</p>
          )}
        </div>

        {/* Health */}
        <div className="card" style={{ animationDelay: "160ms" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "var(--s-4)" }}>
            JordiWild — Health
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            <HealthRow label="Steps today" value={health?.steps?.today?.toLocaleString() ?? "—"} />
            <HealthRow label="7d average" value={Math.round(health?.steps?.avg7d ?? 0).toLocaleString()} />
            <HealthRow label="Trend" value={health?.steps?.trend === "up" ? "↗ rising" : health?.steps?.trend === "down" ? "↘ falling" : "→ stable"} />
            {health?.weight && (
              <>
                <HealthRow label="Weight" value={`${health.weight.current} kg`} />
                <HealthRow label="7d avg weight" value={`${health.weight.avg7d} kg`} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* News */}
      <div className="fade-in" style={{ animationDelay: "240ms" }}>
        <div className="card">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "var(--s-4)" }}>
            News — Latest
          </div>
          {news?.articles && news.articles.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--s-3)" }}>
              {news.articles.slice(0, 6).map((article, i) => (
                <div key={i} style={{ padding: "var(--s-3)", background: "var(--color-code-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--r-sm)" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-1)" }}>
                    {article.source}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
                    {article.title}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>No new articles</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, positive, delay = 0 }: { label: string; value: string; sub?: string; positive?: boolean; delay?: number }) {
  return (
    <div className="card" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-3)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", color: positive != null ? (positive ? "var(--color-success)" : "var(--color-danger)") : "var(--color-text-muted)", marginTop: "var(--s-1)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "var(--s-2)", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}
