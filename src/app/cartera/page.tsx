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

  if (loading) return <div className="p-8 text-text-muted animate-pulse">Cargando cartera...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">🦈 Tiburón — Cartera</h2>
        <p className="text-text-muted text-sm mt-1">Tu portfolio de Revolut + Crypto</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-text-muted">Total invertido</div>
          <div className="text-2xl font-bold text-text mt-1">€{data?.total_invested?.toFixed(2)}</div>
        </div>
        <div className="bg-bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-text-muted">Valor actual</div>
          <div className="text-2xl font-bold text-text mt-1">€{data?.total_current?.toFixed(2)}</div>
        </div>
        <div className="bg-bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-text-muted">P&L</div>
          <div className={`text-2xl font-bold mt-1 ${data && data.total_pnl >= 0 ? "text-success" : "text-danger"}`}>
            {data?.total_pnl && data.total_pnl >= 0 ? "+" : ""}{data?.total_pnl?.toFixed(2)}€
          </div>
          <div className={`text-xs ${data && data.total_pnl_pct >= 0 ? "text-success" : "text-danger"}`}>
            {data?.total_pnl_pct && data.total_pnl_pct >= 0 ? "+" : ""}{data?.total_pnl_pct}%
          </div>
        </div>
      </div>

      {/* BTC */}
      {data?.btc && data.btc.quantity > 0 && (
        <div className="bg-bg-card rounded-xl border border-border p-5">
          <h3 className="text-lg font-semibold text-text mb-3">₿ Bitcoin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-text-muted text-sm">Cantidad</span>
              <div className="text-text font-medium">{data.btc.quantity}</div>
            </div>
            <div>
              <span className="text-text-muted text-sm">Precio</span>
              <div className="text-text font-medium">€{data.btc.price?.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-text-muted text-sm">Valor</span>
              <div className="text-text font-medium">€{data.btc.value?.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings */}
      <div className="bg-bg-card rounded-xl border border-border p-5">
        <h3 className="text-lg font-semibold text-text mb-4">Holdings</h3>
        {data?.items && data.items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted border-b border-border">
                <th className="text-left py-2 px-3">Ticker</th>
                <th className="text-right py-2 px-3">Cantidad</th>
                <th className="text-right py-2 px-3">Coste medio</th>
                <th className="text-right py-2 px-3">Precio actual</th>
                <th className="text-right py-2 px-3">Valor</th>
                <th className="text-right py-2 px-3">P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.ticker} className="border-b border-border last:border-0 hover:bg-bg-hover">
                  <td className="py-3 px-3 font-medium text-text">{item.ticker}</td>
                  <td className="py-3 px-3 text-right text-text-muted">{item.quantity}</td>
                  <td className="py-3 px-3 text-right text-text-muted">€{item.avg_cost.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-text">€{item.current_price.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-text font-medium">€{item.value.toFixed(2)}</td>
                  <td className={`py-3 px-3 text-right font-medium ${item.pnl_pct >= 0 ? "text-success" : "text-danger"}`}>
                    {item.pnl_pct >= 0 ? "+" : ""}{item.pnl_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-text-muted">Sin posiciones</p>
        )}
      </div>
    </div>
  );
}
