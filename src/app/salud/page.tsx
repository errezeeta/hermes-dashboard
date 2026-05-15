"use client";

import { useEffect, useState } from "react";

interface HealthData {
  steps: { today: number; avg7d: number; avg30d: number; trend: string };
  weight: { current: number; avg7d: number; trend: string } | null;
  sleep: any;
}

export default function SaludPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/salud").then(r => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-text-muted animate-pulse">Cargando salud...</div>;

  const trendIcon = (t: string) => t === "up" ? "↗️" : t === "down" ? "↘️" : "➡️";
  const trendColor = (t: string) => t === "up" ? "text-success" : t === "down" ? "text-danger" : "text-text-muted";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">💪 JordiWild — Salud</h2>
        <p className="text-text-muted text-sm mt-1">Métricas de salud y bienestar</p>
      </div>

      {data?.steps && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pasos hoy" value={data.steps.today.toLocaleString()} icon="🚶" />
          <StatCard title="Media 7 días" value={Math.round(data.steps.avg7d).toLocaleString()} icon="📊" />
          <StatCard title="Media 30 días" value={Math.round(data.steps.avg30d).toLocaleString()} icon="📈" />
          <div className="bg-bg-card rounded-xl border border-border p-5">
            <div className="text-sm text-text-muted">Tendencia</div>
            <div className={`text-2xl mt-1 ${trendColor(data.steps.trend)}`}>
              {trendIcon(data.steps.trend)} {data.steps.trend === "up" ? "Subiendo" : data.steps.trend === "down" ? "Bajando" : "Estable"}
            </div>
          </div>
        </div>
      )}

      {data?.weight && (
        <div className="bg-bg-card rounded-xl border border-border p-5">
          <h3 className="text-lg font-semibold text-text mb-4">⚖️ Peso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-text-muted text-sm">Actual</span>
              <div className="text-2xl font-bold text-text mt-1">{data.weight.current} kg</div>
            </div>
            <div>
              <span className="text-text-muted text-sm">Media 7 días</span>
              <div className="text-2xl font-bold text-text mt-1">{data.weight.avg7d} kg</div>
            </div>
          </div>
        </div>
      )}

      {/* Step goal progress */}
      {data?.steps && (
        <div className="bg-bg-card rounded-xl border border-border p-5">
          <h3 className="text-lg font-semibold text-text mb-4">🎯 Objetivo 10,000 pasos</h3>
          <div className="w-full bg-bg h-4 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${Math.min((data.steps.today / 10000) * 100, 100)}%` }}
            />
          </div>
          <div className="text-sm text-text-muted mt-2">
            {Math.round((data.steps.today / 10000) * 100)}% completado
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <div className="text-sm text-text-muted">{icon} {title}</div>
      <div className="text-2xl font-bold text-text mt-2">{value}</div>
    </div>
  );
}
