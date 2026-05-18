import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hermes Dashboard",
  description: "Multi-agent ecosystem control panel",
};

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/cartera", label: "Cartera" },
  { href: "/salud", label: "Salud" },
  { href: "/news", label: "News" },
  { href: "/actividad", label: "Actividad" },
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
          {/* Sidebar */}
          <aside
            style={{
              width: "200px",
              borderRight: "1px solid var(--color-border)",
              background: "var(--color-bg-surface)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Logo */}
            <div style={{ padding: "var(--s-6)", borderBottom: "1px solid var(--color-border)" }}>
              <a
                href="/"
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                }}
              >
                HERMES
              </a>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginTop: "4px",
                }}
              >
                Dashboard v0.1
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "var(--s-4)", display: "flex", flexDirection: "column", gap: "2px" }}>
              {navItems.map((item) => (
                <NavKey key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>

            {/* Status */}
            <div style={{ padding: "var(--s-4)", borderTop: "1px solid var(--color-border)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                <span className="status-dot status-dot--online"></span>
                Gateway
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavKey({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="nav-link">
      {label}
    </a>
  );
}
