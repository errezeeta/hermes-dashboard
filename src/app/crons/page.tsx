"use client";

import { useEffect, useState } from "react";

interface CronJob {
  id: string;
  status: string;
  name: string;
  schedule: string;
  repeat: string;
  next_run: string;
  last_run: string;
  deliver: string;
}

interface CronData {
  cron_jobs?: CronJob[];
}

function formatSchedule(s: string): string {
  if (s.startsWith("0")) return `daily ${s.split(" ")[1]}:00`;
  if (s.includes("*/")) return `every ${s.match(/\*\/(\d+)/)?.[1] || "?"}min`;
  if (s.startsWith("*/")) return `every ${s.split(" ")[0].replace("*/", "")}min`;
  if (s.includes("* *")) return "every minute";
  return s;
}

function statusColor(status: string): string {
  return status === "active" ? "var(--color-success)" : "var(--color-text-muted)";
}

export default function CronsPage() {
  const [data, setData] = useState<CronData | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(setData);
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-6)" }}>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "var(--s-1)" }}>
          System
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Crons
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "var(--s-1)" }}>
          {data?.cron_jobs?.length ?? "..."} scheduled jobs
        </div>
      </div>

      {data?.cron_jobs?.map((job) => (
        <div key={job.id} className="card fade-in" style={{ padding: "var(--s-4)", marginBottom: "var(--s-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--s-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)" }}>
              <span className="status-dot" style={{
                width: 8, height: 8,
                background: statusColor(job.status),
                boxShadow: job.status === "active" ? `0 0 6px ${statusColor(job.status)}` : "none"
              }} />
              <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                {job.name || job.id}
              </span>
            </div>
            <span style={{
              fontFamily: "'VT323', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "3px 8px",
              border: `1px solid ${statusColor(job.status)}`,
              borderRadius: "var(--r-sm)",
              color: statusColor(job.status),
              background: job.status === "active" ? "rgba(74,154,74,0.08)" : "transparent"
            }}>
              {job.status}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--s-2)" }}>
            {job.schedule && (
              <div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Schedule
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-primary)" }}>
                  {formatSchedule(job.schedule)}
                </div>
              </div>
            )}
            {job.next_run && (
              <div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Next Run
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-primary)" }}>
                  {new Date(job.next_run).toLocaleString()}
                </div>
              </div>
            )}
            {job.last_run && (
              <div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Last Run
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-primary)" }}>
                  {new Date(job.last_run).toLocaleString()}
                </div>
              </div>
            )}
            {job.deliver && (
              <div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Deliver
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.75rem", color: "var(--color-text-primary)" }}>
                  {job.deliver}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {data && (!data.cron_jobs || data.cron_jobs.length === 0) && (
        <div className="card" style={{ padding: "var(--s-4)" }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
            No cron jobs found
          </p>
        </div>
      )}

      {!data && (
        <div className="card" style={{ padding: "var(--s-4)" }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            loading...
          </div>
        </div>
      )}
    </div>
  );
}
