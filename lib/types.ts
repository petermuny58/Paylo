export type DashboardPot = {
  id: string;
  name: string;
  balance: number;
  pct: number;
};

export type DashboardTransaction = {
  id: string;
  label: string;
  amount: number;
  dir: "in" | "out";
};

export type DashboardData = {
  walletBalance: number;
  pots: DashboardPot[];
  recentActivity: DashboardTransaction[];
};
