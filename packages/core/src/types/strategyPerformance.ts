export type StrategyPerformanceTotals = {
  bets: number;
  wins: number;
  losses: number;
  profit: number;
};

export type StrategyPerformance = {
  strategyId: string;
  strategyVersion: number;
  league: { id: number; name: string; country: string };
  season: number;
  seasonPerformance: StrategyPerformanceTotals;
  weeks: Record<string, StrategyPerformanceTotals>;
  months: Record<string, StrategyPerformanceTotals>;
  recalculatedAt: string;
};
