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

  useEffect(() => {
    Promise.all([
      fetch("/api/cartera").then(r => r.json()),
      fetch("/api/salud").then(r => r.json()),
      fetch("/api/news").then(r => r.json()),
    ]).then(([p, h, n]) => {
      setPortfolio(p);
      setHealth(h);
      setNews(n);
      setLoading(false);
    });

    // Refresh every 30s
    const interval = setInterval(() => {
      fetch("/api/cartera").then(r => r.json()).then(setPortfolio);
      fetch("/api/salud").then(r => r.json()).then(setHealth);
      fetch("/api/news").then(r => r.json()).then(setNews);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text-muted animate-pulse">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text">Dashboard Overview</h2>
        <p className="text-text-muted text-sm mt-1">Todos tus agentes en un vistazo</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="💰 Cartera Total"
          value={`€${portfolio?.total_current?.toFixed(2) ?? "0"}`}
          subtitle={
            portfolio?.total_pnl_pct
              ? `${portfolio.total_pnl > 0 ? "+" : ""}${portfolio.total_pnl_pct}%`
              : "—"
          }
          color={portfolio && portfolio.total_pnl >= 0 ? "text-success" : "text-danger"}
        />
        <SummaryCard
          title="🚶 Pasos Hoy"
          value={health?.steps?.today?.toLocaleString() ?? "0"}
          subtitle={`Media 7d: ${Math.round(health?.steps?.avg7d ?? 0).toLocaleString()}`}
          color="text-accent-cyan"
        />
        <SummaryCard
          title="📰 Noticias"
          value={news?.total?.toString() ?? "0"}
          subtitle="Artículos sin leer"
          color="text-warning"
        />
        <SummaryCard
          title="₿ BTC"
          value={portfolio?.btc?.price ? `€${portfolio.btc.price.toLocaleString()}` : "—"}
          subtitle={portfolio?.btc?.quantity ? `${portfolio.btc.quantity} BTC` : "—"}
          color="text-accent-orange"
        />
      </div>

      {/* Portfolio + Health row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio */}
        <div className="bg-bg-card rounded-xl border border-border p-6 card-hover">
          <h3 className="text-lg font-semibold text-text mb-4">🦈 Tiburón — Cartera</h3>
          {portfolio?.items && portfolio.items.length > 0 ? (
            <div className="space-y-3">
              {portfolio.items.map((item) => (
                <div key={item.ticker} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium text-text">{item.ticker}</span>
                    <span className="text-text-muted text-sm ml-2">{item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-text">€{item.value.toFixed(2)}</div>
                    <div className={`text-xs ${item.pnl_pct >= 0 ? "text-success" : "text-danger"}`}>
                      {item.pnl_pct >= 0 ? "+" : ""}{item.pnl_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">Sin posiciones por ahora</p>
          )}
        </div>

        {/* Health */}
        <div className="bg-bg-card rounded-xl border border-border p-6 card-hover">
          <h3 className="text-lg font-semibold text-text mb-4">💪 JordiWild — Salud</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Pasos hoy</span>
              <span className="text-text font-medium">{health?.steps?.today?.toLocaleString() ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Media 7 días</span>
              <span className="text-text font-medium">{Math.round(health?.steps?.avg7d ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Tendencia</span>
              <span className={`font-medium ${health?.steps?.trend === "up" ? "text-success" : health?.steps?.trend === "down" ? "text-danger" : "text-text-muted"}`}>
                {health?.steps?.trend === "up" ? "↗️ Subiendo" : health?.steps?.trend === "down" ? "↘️ Bajando" : "➡️ Estable"}
              </span>
            </div>
            {health?.weight && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Peso actual</span>
                  <span className="text-text font-medium">{health.weight.current} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Media 7d</span>
                  <span className="text-text font-medium">{health.weight.avg7d} kg</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* News row */}
      <div className="bg-bg-card rounded-xl border border-border p-6 card-hover">
        <h3 className="text-lg font-semibold text-text mb-4">☝️🤓 News — Últimas Noticias</h3>
        {news?.articles && news.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.articles.slice(0, 9).map((article, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg-hover border border-border">
                <div className="text-xs text-text-muted uppercase mb-1">{article.source}</div>
                <div className="text-sm text-text">{article.title}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">Sin noticias nuevas</p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5 card-hover">
      <div className="text-sm text-text-muted mb-1">{title}</div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className={`text-xs mt-1 ${color}`}>{subtitle}</div>
    </div>
  );
}
