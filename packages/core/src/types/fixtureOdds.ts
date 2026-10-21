export type FixtureOdds = {
  fixtureId: number;
  source: "Bet365" | "Betfair";
  odds: Array<{ id: number; name: string; values: Array<Record<string, unknown>> }>;
  syncedAt: string;
};
