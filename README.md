# 🏠 Hermes Dashboard

Multi-agent ecosystem dashboard for **Hermes Agent** — your local-first AI infrastructure.

## Features

- **📊 Overview** — Dashboard principal con todas las métricas de un vistazo
- **🦈 Cartera** — Portfolio de inversión (Revolut + Crypto) con precios en tiempo real
- **💪 Salud** — Métricas de salud: pasos, peso, sueño desde Google Fit / Xiaomi Watch
- **☝️🤓 News** — Últimas noticias de tus feeds RSS (Gizmodo, Xataka, Marca, etc.)
- **📡 Actividad** — Logs en tiempo real de los agentes del sistema

## Architecture

```
┌──────────────────────────────────────────┐
│          Next.js Dashboard               │
│  localhost:3000                          │
│                                          │
│  ├── /api/cartera  → revolut-portfolio.py│
│  ├── /api/salud    → dashboard-health.py │
│  ├── /api/news     → dashboard-news.py   │
│  └── /api/activity → gateway.log         │
└──────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────┐
│        Local Data Sources                │
│                                          │
│  ├── ~/.hermes/data/revolut/*.csv        │
│  ├── ~/.hermes/sub-agents/*/data/*.csv   │
│  ├── ~/.hermes/scripts/*.py              │
│  └── ~/.hermes/logs/gateway.log          │
└──────────────────────────────────────────┘
```

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/hermes-dashboard.git
cd hermes-dashboard

# Install
npm install

# Run dev server
npm run dev

# Open
open http://localhost:3000
```

## Data Sources

The dashboard pulls data from your local Hermes Agent installation:

| Tab | Source | Script |
|-----|--------|--------|
| Cartera | Revolut CSVs + Yahoo Finance + CoinGecko | `dashboard-portfolio.py` |
| Salud | Google Fit sync (Xiaomi Watch 2) | `dashboard-health.py` |
| News | blogwatcher-cli RSS feeds | `dashboard-news.py` |
| Actividad | Gateway log parsing | Built-in |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Runtime**: Node.js → Python scripts via child_process
- **Data**: 100% local, zero cloud dependency

## License

MIT
