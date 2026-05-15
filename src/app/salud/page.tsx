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

  if (loading) return <Loading />;

  const trendLabel = (t: string) => t === "up" ? "↗ rising" : t === "down" ? "↘ falling" : "→ stable";
  const trendColor = (t: string) => t === "up" ? "var(--color-success)" : t === "down" ? "var(--color-danger)" : "var(--color-text-muted)";
  const stepPct = data?.steps ? Math.min((data.steps.today / 10000) * 100, 100) : 0;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-12)" }}>
        <div className="step-label" style={{ marginBottom: "var(--s-3)" }}>JordiWild</div>
        <h1 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
          Health Metrics
        </h1>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "var(--s-2)" }}>
          Steps, weight, sleep. Source: Google Fit via Xiaomi Watch 2.
        </p>
      </div>

      {data?.steps && (
        <>
          {/* Steps grid */}
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--s-4)", marginBottom: "var(--s-8)" }}>
            <MetricBlock label="STEPS TODAY" value={data.steps.today.toLocaleString()} />
            <MetricBlock label="7D AVERAGE" value={Math.round(data.steps.avg7d).toLocaleString()} />
            <MetricBlock label="30D AVERAGE" value={Math.round(data.steps.avg30d).toLocaleString()} />
            <div className="card">
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-3)" }}>
                TREND
              </div>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "1.1rem", color: trendColor(data.steps.trend), lineHeight: 1.1 }}>
                {trendLabel(data.steps.trend)}
              </div>
            </div>
          </div>

          {/* Step goal */}
          <div className="card fade-in" style={{ marginBottom: "var(--s-8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--s-3)" }}>
              <div className="step-label">Daily Goal — 10,000 steps</div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                {Math.round(stepPct)}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${stepPct}%` }} />
            </div>
          </div>
        </>
      )}

      {/* Weight */}
      {data?.weight && (
        <div className="card fade-in" style={{ marginBottom: "var(--s-8)" }}>
          <div className="step-label" style={{ marginBottom: "var(--s-4)" }}>Weight</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--s-6)" }}>
            <Stat label="Current" value={`${data.weight.current} kg`} />
            <Stat label="7d Average" value={`${data.weight.avg7d} kg`} />
            <Stat label="Trend" value={trendLabel(data.weight.trend)} color={trendColor(data.weight.trend)} />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-3)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--s-1)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "1rem", color: color ?? "var(--color-text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>loading health data...</span>
    </div>
  );
}
