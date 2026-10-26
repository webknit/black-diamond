export type StrategyResult = {
  fixtureId: number;
  leagueId: number;
  season: number;
  fixtureTimestamp: number;
  strategyId: string;
  strategyVersion: number;
  referenceOdd: number | null;
  eligible: boolean;
  result: "won" | "lost" | null;
  profit: number | null;
  evaluatedAt: string;
};
