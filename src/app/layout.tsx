import type { Metadata } from "next";
import "./globals.css";
import ThemeControls from "./ThemeControls";

export const metadata: Metadata = {
  title: "Marlonbot 0.1",
  description: "Multi-agent ecosystem control panel",
};

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/cartera", label: "Cartera" },
  { href: "/salud", label: "Salud" },
  { href: "/news", label: "News" },
  { href: "/actividad", label: "Actividad" },
  { href: "/agents", label: "Agents" },
  { href: "/crons", label: "Crons" },
];

const sysItems = [
  { href: "/agents", label: "Agents" },
  { href: "/crons", label: "Crons" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased hermes-ui theme-dark theme-amber" style={{ background: "var(--color-bg-base)" }}>
        <div className="hermes-shell" style={{ display: "flex", minHeight: "100vh" }}>
          {/* Mobile top bar */}
          <header className="mobile-bar">
            <a href="/" className="mobile-brand">Marlonbot</a>
            <nav className="mobile-nav">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="mobile-nav-link">
                  {item.label}
                </a>
              ))}
            </nav>
          </header>

          {/* Sidebar (desktop) */}
          <aside className="sidebar" style={{ width: "240px" }}>
            {/* Logo */}
            <div className="sidebar-logo">
              <a href="/" className="sidebar-brand">Marlonbot</a>
              <div className="sidebar-sub">
                Dashboard <span style={{ color: "var(--color-amber)" }}>v0.1</span>
              </div>
              <div style={{ marginTop: "var(--s-4)", display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="status-dot status-dot--online"></span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  System Online
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
              <div className="nav-section-title">Navigation</div>
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </a>
              ))}
              <div className="nav-section-title" style={{ marginTop: "var(--s-3)" }}>System</div>
              {sysItems.map((item) => (
                <a key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
              <div className="sidebar-status">
                <span className="status-dot status-dot--online"></span>
                Gateway
              </div>
              <ThemeControls />
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 2 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
