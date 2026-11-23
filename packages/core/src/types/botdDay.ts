export type BotdDayFixture = {
  fixtureId: number;
  /**
   * Persisted with the candidate so the presentation layer can avoid treating
   * multiple fixtures from one league as independent recommendations.
   * Older cached BotD days do not have this field and are left uncapped until
   * their next scheduled refresh.
   */
  leagueId?: number;
  matches: Array<{
    strategyId: string;
    referenceOdd: number | null;
    tier: "emerging" | "lowConfidence" | "eligible" | "strong" | "highConfidence";
    leaguePerformance: { bets: number; wins: number; losses: number; profit: number };
  }>;
  hasLeagueTable: boolean;
};

/** Ready-to-render BotD candidates for one UK calendar day. */
export type BotdDay = {
  fixtureDate: string;
  fixtures: BotdDayFixture[];
  updatedAt: string;
};
