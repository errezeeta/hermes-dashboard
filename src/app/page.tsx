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
  const [system, setSystem] = useState<{ cron_text?: string; cron_lines?: string[] } | null>(null);

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

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ color: "var(--color-text-muted)", fontFamily: "'VT323', monospace", fontSize: "0.875rem" }}>
          initializing...
        </span>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      {/* Header */}
      <div className="fade-in" style={{ marginTop: "var(--s-4)", marginBottom: "var(--s-6)" }}>
        <div>
          <div className="glitch" data-text="Marlonbot 0.1" style={{ fontFamily: "'Jacquard 12', monospace", fontSize: "clamp(2.2rem, 5vw, 3.2rem)", color: "var(--color-text-primary)", letterSpacing: "0.04em", lineHeight: 1.15, margin: 0 }}>
            Marlonbot 0.1
          </div>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "var(--s-1)", lineHeight: 1.5 }}>
            Multi-agent ecosystem control panel. Local-first. Noisy by design.
          </p>
          <div style={{ display: "flex", gap: "var(--s-3)", marginTop: "var(--s-3)", flexWrap: "wrap", alignItems: "center" }}>
            <a className="btn-amber" href="/cartera">Open Console</a>
            <a className="btn-amber" href="/actividad">Live Signal</a>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="fade-in metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
        <MetricCard label="CARTERA TOTAL" value={`€${portfolio?.total_current?.toFixed(2) ?? "0"}`} sub={portfolio?.total_pnl_pct != null ? `${portfolio.total_pnl >= 0 ? "+" : ""}${portfolio.total_pnl_pct}%` : undefined} positive={portfolio?.total_pnl != null && portfolio.total_pnl >= 0} delay={0} />
        <MetricCard label="PASOS HOY" value={health?.steps?.today?.toLocaleString() ?? "—"} sub={`media 7d: ${Math.round(health?.steps?.avg7d ?? 0).toLocaleString()}`} delay={80} />
        <MetricCard label="NOTICIAS" value={news?.total?.toString() ?? "0"} sub="artículos" delay={160} />
        <MetricCard label="BTC PRICE" value={portfolio?.btc?.price ? `€${portfolio.btc.price.toLocaleString()}` : "—"} sub={portfolio?.btc?.quantity ? `${portfolio.btc.quantity} BTC` : undefined} delay={240} />
      </div>

      {/* Automations */}
      <div className="fade-in" style={{ marginBottom: "var(--s-4)" }}>
        <div className="card" style={{ padding: "var(--s-3)" }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Automations
          </div>
          {system?.cron_lines && system.cron_lines.length > 0 ? (
            <div style={{ marginTop: "var(--s-1)", display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
              {system.cron_lines.slice(0, 6).map((line, idx) => (
                <div key={idx} style={{ fontFamily: "'VT323', monospace", fontSize: "0.65rem", color: "var(--color-text-primary)", padding: "3px 8px", background: "var(--color-code-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--r-sm)" }}>
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-primary)", marginTop: "var(--s-1)" }}>
              loading
            </div>
          )}
        </div>
      </div>

      {/* Portfolio + Health */}
      <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
        <div className="card" style={{ padding: "var(--s-4)", animationDelay: "80ms" }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "var(--s-3)" }}>
            Tiburón — Portfolio
          </div>
          {portfolio?.items && portfolio.items.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
              {portfolio.items.map((item) => (
                <div key={item.ticker} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--s-1)", borderBottom: "1px solid var(--color-border)" }}>
                  <div>
                    <span style={{ fontFamily: "'VT323', monospace", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-primary)" }}>{item.ticker}</span>
                    <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", color: "var(--color-text-muted)", marginLeft: "var(--s-2)" }}>{item.quantity}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-primary)" }}>€{item.value.toFixed(2)}</div>
                    <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.65rem", color: item.pnl_pct >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                      {item.pnl_pct >= 0 ? "+" : ""}{item.pnl_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>No positions</p>
          )}
        </div>

        <div className="card" style={{ padding: "var(--s-4)", animationDelay: "160ms" }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "var(--s-3)" }}>
            JordiWild — Health
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
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
        <div className="card" style={{ padding: "var(--s-4)" }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "var(--s-3)" }}>
            News — Latest
          </div>
          {news?.articles && news.articles.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--s-2)" }}>
              {news.articles.slice(0, 6).map((article, i) => (
                <div key={i} style={{ padding: "var(--s-2)", background: "var(--color-code-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--r-sm)" }}>
                  <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-1)" }}>
                    {article.source}
                  </div>
                  <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-primary)", lineHeight: 1.4 }}>
                    {article.title}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>No new articles</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, positive, delay = 0 }: { label: string; value: string; sub?: string; positive?: boolean; delay?: number }) {
  return (
    <div className="card" style={{ padding: "var(--s-3)", animationDelay: `${delay}ms` }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-1)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: "1.2rem", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.65rem", color: positive != null ? (positive ? "var(--color-success)" : "var(--color-danger)") : "var(--color-text-muted)", marginTop: "2px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "var(--s-1)", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}
