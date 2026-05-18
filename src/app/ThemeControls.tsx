"use client";

import { useEffect, useState } from "react";

type ThemeState = { mode: "dark" | "light"; accent: "accent" | "cyan" };

function readTheme(): ThemeState {
  if (typeof window === "undefined") return { mode: "dark", accent: "accent" };
  try {
    const stored = window.localStorage.getItem("hb-theme");
    if (!stored) return { mode: "dark", accent: "accent" };
    return JSON.parse(stored);
  } catch {
    return { mode: "dark", accent: "accent" };
  }
}

function applyTheme(t: ThemeState) {
  const body = document.body;
  body.classList.remove("theme-dark", "theme-light", "theme-accent", "theme-cyan");
  body.classList.add(`theme-${t.mode}`, `theme-${t.accent}`);
  window.localStorage.setItem("hb-theme", JSON.stringify(t));
}

export default function ThemeControls() {
  const [theme, setTheme] = useState<ThemeState>({ mode: "dark", accent: "accent" });

  useEffect(() => {
    const t = readTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const update = (next: ThemeState) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div>
      <div className="sidebar-status">Display</div>
      <div className="sidebar-theme-row">
        <button
          className={`sidebar-theme-chip${theme.mode === "dark" ? " sidebar-theme-chip--active" : ""}`}
          onClick={() => update({ ...theme, mode: "dark" })}
        >
          Dark
        </button>
        <button
          className={`sidebar-theme-chip${theme.mode === "light" ? " sidebar-theme-chip--active" : ""}`}
          onClick={() => update({ ...theme, mode: "light" })}
        >
          Light
        </button>
      </div>
      <div className="sidebar-theme-row" style={{ marginTop: 4 }}>
        <button
          className={`sidebar-theme-chip${theme.accent === "accent" ? " sidebar-theme-chip--active" : ""}`}
          onClick={() => update({ ...theme, accent: "accent" })}
        >
          Blue
        </button>
        <button
          className={`sidebar-theme-chip${theme.accent === "cyan" ? " sidebar-theme-chip--active" : ""}`}
          onClick={() => update({ ...theme, accent: "cyan" })}
        >
          Green
        </button>
      </div>
    </div>
  );
}
