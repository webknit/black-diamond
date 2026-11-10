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
  league: { id: number; name: string; country: string };
  season: number;
  seasonPerformance: StrategyPerformanceTotals;
  weeks: Record<string, StrategyPerformanceTotals>;
  months: Record<string, StrategyPerformanceTotals>;
  oddsBands: Record<string, StrategyPerformanceOddsBand>;
  recalculatedAt: string;
};

export type StrategyLeaguePerformance = {
  leagueId: number;
  name: string;
  country: string;
  bets: number;
  wins: number;
  losses: number;
  profit: number;
  /** Totals at this strategy's configured minimum/bettable odds. */
  bettablePerformance: StrategyPerformanceTotals;
};

// A compact all-selected-leagues view. The web app reads these rather than
// combining the per-league records in a request.
export type StrategyPerformanceSummary = Omit<StrategyPerformance, 'league' | 'season'> & {
  leaguePerformances: StrategyLeaguePerformance[];
};
