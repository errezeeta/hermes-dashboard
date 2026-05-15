import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hermes Dashboard",
  description: "Multi-agent ecosystem control panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        <div className="flex h-screen bg-bg text-text">
          {/* Sidebar */}
          <aside className="w-64 border-r border-border bg-bg-elevated flex flex-col">
            <div className="p-6 border-b border-border">
              <h1 className="text-xl font-bold gradient-text">⚡ Hermes</h1>
              <p className="text-xs text-text-muted mt-1">Dashboard v0.1</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <SidebarLink href="/" icon="📊" label="Overview" />
              <SidebarLink href="/cartera" icon="🦈" label="Cartera" />
              <SidebarLink href="/salud" icon="💪" label="Salud" />
              <SidebarLink href="/news" icon="☝️🤓" label="News" />
              <SidebarLink href="/actividad" icon="📡" label="Actividad" />
            </nav>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="w-2 h-2 rounded-full bg-success pulse-dot"></div>
                <span>Gateway online</span>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-bg-hover transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-text">{label}</span>
    </a>
  );
}
