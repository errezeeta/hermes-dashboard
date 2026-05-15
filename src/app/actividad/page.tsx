"use client";

import { useEffect, useState } from "react";

interface ActivityLog {
  timestamp: string;
  agent: string;
  message: string;
  type: string;
}

interface ActivityData {
  agents: { name: string; emoji: string; status: string; lastRun: string; nextRun: string }[];
  logs: ActivityLog[];
}

export default function ActividadPage() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-text-muted animate-pulse">Cargando actividad...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">📡 Actividad de Agentes</h2>
        <p className="text-text-muted text-sm mt-1">Estado y logs del sistema</p>
      </div>

      {/* Agent status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.agents.map((agent) => (
          <div key={agent.name} className="bg-bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <div className="font-semibold text-text">{agent.name}</div>
                <div className={`text-xs ${agent.status === "online" ? "text-success" : "text-text-muted"}`}>
                  <span className="inline-block w-2 h-2 rounded-full bg-current mr-1 pulse-dot"></span>
                  {agent.status}
                </div>
              </div>
            </div>
            <div className="text-xs text-text-muted space-y-1">
              <div>Última ejecución: {agent.lastRun}</div>
              <div>Próxima: {agent.nextRun}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Logs */}
      <div className="bg-bg-card rounded-xl border border-border p-5">
        <h3 className="text-lg font-semibold text-text mb-4">Logs</h3>
        <div className="space-y-1 font-mono text-xs">
          {data?.logs && data.logs.length > 0 ? (
            data.logs.map((log, i) => (
              <div key={i} className={`flex gap-3 py-1 px-2 rounded ${log.type === "warning" ? "bg-warning/5" : log.type === "error" ? "bg-danger/5" : ""}`}>
                <span className="text-text-dim whitespace-nowrap">{log.timestamp}</span>
                <span className="whitespace-nowrap">{log.agent}</span>
                <span className="text-text-muted truncate">{log.message}</span>
              </div>
            ))
          ) : (
            <p className="text-text-muted">Sin logs recientes</p>
          )}
        </div>
      </div>
    </div>
  );
}
