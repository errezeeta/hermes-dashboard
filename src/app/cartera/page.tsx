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

export default function CarteraPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cartera").then(r => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-12)" }}>
        <div className="step-label" style={{ marginBottom: "var(--s-3)" }}>Tiburón</div>
        <h1 style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
          Portfolio
        </h1>
        <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "var(--s-2)" }}>
          Revolut holdings + crypto. Prices via Yahoo Finance / CoinGecko.
        </p>
      </div>

      {/* Summary */}
      <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--s-4)", marginBottom: "var(--s-12)" }}>
        <SummaryBlock label="INVESTED" value={`€${data?.total_invested?.toFixed(2) ?? "0"}`} />
        <SummaryBlock label="CURRENT VALUE" value={`€${data?.total_current?.toFixed(2) ?? "0"}`} />
        <SummaryBlock
          label="P&L"
          value={`${data?.total_pnl != null && data.total_pnl >= 0 ? "+" : ""}${data?.total_pnl?.toFixed(2)}€ (${data?.total_pnl_pct != null && data.total_pnl_pct >= 0 ? "+" : ""}${data?.total_pnl_pct}%)`}
          positive={data?.total_pnl != null && data.total_pnl >= 0}
        />
      </div>

      {/* BTC */}
      {data?.btc && data.btc.quantity > 0 && (
        <div className="card fade-in" style={{ marginBottom: "var(--s-8)" }}>
          <div className="step-label" style={{ marginBottom: "var(--s-3)" }}>Bitcoin</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--s-6)" }}>
            <Stat label="Quantity" value={data.btc.quantity.toString()} />
            <Stat label="Price" value={`€${data.btc.price?.toLocaleString()}`} />
            <Stat label="Value" value={`€${data.btc.value?.toFixed(2)}`} />
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="card fade-in">
        <div className="step-label" style={{ marginBottom: "var(--s-4)" }}>Holdings</div>
        {data?.items && data.items.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th style={{ textAlign: "right" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Avg Cost</th>
                <th style={{ textAlign: "right" }}>Price</th>
                <th style={{ textAlign: "right" }}>Value</th>
                <th style={{ textAlign: "right" }}>P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.ticker}>
                  <td style={{ fontFamily: "'VT323', monospace", fontWeight: 600 }}>{item.ticker}</td>
                  <td style={{ textAlign: "right", fontFamily: "'VT323', monospace", color: "var(--color-text-muted)" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", fontFamily: "'VT323', monospace", color: "var(--color-text-muted)" }}>€{item.avg_cost.toFixed(2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "'VT323', monospace" }}>€{item.current_price.toFixed(2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "'VT323', monospace", fontWeight: 500 }}>€{item.value.toFixed(2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "'VT323', monospace", color: item.pnl_pct >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                    {item.pnl_pct >= 0 ? "+" : ""}{item.pnl_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>No positions</p>
        )}
      </div>
    </div>
  );
}

function SummaryBlock({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="card">
      <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-3)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: "1.5rem", fontWeight: 700, color: positive != null ? (positive ? "var(--color-success)" : "var(--color-danger)") : "var(--color-text-primary)", lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-1)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: "1rem", color: "var(--color-text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>loading portfolio...</span>
    </div>
  );
}
