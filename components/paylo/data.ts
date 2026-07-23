export const initialPots = [
  { id: 'restock', name: 'Restock', balance: 34000, pct: 60 },
  { id: 'takehome', name: 'Take-Home', balance: 21000, pct: 25 },
  { id: 'savings', name: 'Savings', balance: 9500, pct: 15 },
  { id: 'tax', name: 'Tax Reserve', balance: 4000, pct: 0 },
];

export const recentActivity = [
  { id: 1, label: 'Sale — Mrs. Banda', amount: 2500, dir: 'in' as const },
  { id: 2, label: 'Restock — tomatoes', amount: -8000, dir: 'out' as const },
  { id: 3, label: 'Sale — Mr. Phiri', amount: 1800, dir: 'in' as const },
];

export const chilimbaGroups = [
  { id: 1, name: 'Market Ladies Group', members: 8, position: 3, next: 'K50 due Monday', payoutWeek: 'Week 5 — Faides' },
  { id: 2, name: 'Family Savings Circle', members: 5, position: 1, next: 'K100 due Friday', payoutWeek: 'Week 2 — You' },
];
