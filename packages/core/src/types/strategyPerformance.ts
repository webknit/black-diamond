export type StrategyPerformanceTotals = {
  bets: number;
  wins: number;
  losses: number;
  profit: number;
};

export type StrategyPerformanceOddsBand = {
  seasonPerformance: StrategyPerformanceTotals;
  weeks: Record<string, StrategyPerformanceTotals>;
  months: Record<string, StrategyPerformanceTotals>;
};

export type StrategyPerformance = {
  strategyId: string;
  strategyVersion: number;
  league: { id: number; name: string; country: string };
  season: number;
  seasonPerformance: StrategyPerformanceTotals;
  weeks: Record<string, StrategyPerformanceTotals>;
  months: Record<string, StrategyPerformanceTotals>;
  oddsBands: Record<string, StrategyPerformanceOddsBand>;
  recalculatedAt: string;
};

// A compact all-selected-leagues view. The web app reads these rather than
// combining the per-league records in a request.
export type StrategyPerformanceSummary = Omit<StrategyPerformance, 'league' | 'season'>;
