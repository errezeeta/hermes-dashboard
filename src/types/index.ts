export interface AgentInfo {
  name: string;
  emoji: string;
  status: "online" | "offline" | "idle";
  lastRun: string;
  nextRun: string;
}

export interface PortfolioItem {
  ticker: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  pnlPct: number;
}

export interface PortfolioSummary {
  items: PortfolioItem[];
  totalInvested: number;
  totalCurrent: number;
  totalPnl: number;
  totalPnlPct: number;
  btc: { quantity: number; value: number; price: number };
}

export interface HealthData {
  steps: { today: number; avg7d: number; avg30d: number; trend: "up" | "down" | "stable" };
  weight?: { current: number; avg7d: number; trend: "up" | "down" | "stable" };
  sleep?: { hours: number; minutes: number; quality: string };
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  category: string;
}

export interface ActivityLog {
  timestamp: string;
  agent: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface DashboardData {
  agents: AgentInfo[];
  portfolio: PortfolioSummary;
  health: HealthData;
  news: NewsItem[];
  activity: ActivityLog[];
}
