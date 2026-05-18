"use client";

import { useEffect, useState } from "react";

interface NewsData {
  articles: { title: string; source: string; category: string }[];
  total: number;
}

export default function NewsPage() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/news").then(r => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const categories = [
    { key: "all", label: "ALL" },
    { key: "tech", label: "TECH" },
    { key: "deportes", label: "DEPORTES" },
    { key: "ciencia", label: "CIENCIA" },
  ];
  const filtered = filter === "all" ? data?.articles : data?.articles.filter(a => a.category === filter);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)" }}>
      <div className="fade-in" style={{ marginBottom: "var(--s-8)" }}>
        <div className="step-label" style={{ marginBottom: "var(--s-3)" }}>News</div>
        <h1 style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
          RSS Feed
        </h1>
        <p style={{ fontFamily: "'VT323', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "var(--s-2)" }}>
          {data?.total} unread articles from monitored sources.
        </p>
      </div>

      {/* Filters */}
      <div className="fade-in" style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-8)", flexWrap: "wrap" }}>
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            style={{
              padding: "4px 10px",
              fontFamily: "'VT323', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "var(--r-sm)",
              transition: "all var(--t-fast)",
              background: filter === c.key ? "var(--color-accent)" : "transparent",
              color: filter === c.key ? "var(--color-bg-base)" : "var(--color-text-muted)",
              border: `1px solid ${filter === c.key ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
        {filtered && filtered.length > 0 ? (
          filtered.map((article, i) => (
            <div key={i} className="card" style={{ padding: "var(--s-4)", animationDelay: `${i * 60}ms` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--s-4)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'VT323', monospace", fontSize: "0.875rem", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
                    {article.title}
                  </div>
                </div>
                <div className="badge" style={{ flexShrink: 0, marginTop: "2px" }}>
                  {article.source}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "var(--s-16)", color: "var(--color-text-muted)", fontFamily: "'VT323', monospace", fontSize: "0.875rem" }}>
            No articles in this category
          </div>
        )}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--s-12) var(--s-6)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <span style={{ fontFamily: "'VT323', monospace", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>loading news...</span>
    </div>
  );
}
