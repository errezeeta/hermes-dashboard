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

  if (loading) return <div className="p-8 text-text-muted animate-pulse">Cargando noticias...</div>;

  const categories = ["all", "tech", "deportes", "ciencia"];
  const filtered = filter === "all" ? data?.articles : data?.articles.filter(a => a.category === filter);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">☝️🤓 News — Últimas Noticias</h2>
        <p className="text-text-muted text-sm mt-1">{data?.total} artículos sin leer</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              filter === c
                ? "bg-primary text-white border-primary"
                : "bg-bg-card text-text-muted border-border hover:border-border-light"
            }`}
          >
            {c === "all" ? "Todas" : c === "tech" ? "📱 Tech" : c === "deportes" ? "⚽ Deportes" : "🔬 Ciencia"}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-2">
        {filtered && filtered.length > 0 ? (
          filtered.map((article, i) => (
            <div key={i} className="bg-bg-card rounded-lg border border-border p-4 card-hover flex items-start gap-4">
              <span className="text-lg mt-0.5">
                {article.category === "deportes" ? "⚽" : article.category === "ciencia" ? "🔬" : "📱"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text">{article.title}</div>
                <div className="text-xs text-text-muted mt-1 uppercase">{article.source}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-text-muted text-center py-8">Sin noticias en esta categoría</p>
        )}
      </div>
    </div>
  );
}
