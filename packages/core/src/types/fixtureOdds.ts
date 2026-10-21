export type FixtureOdds = {
  fixtureId: number;
  source: "Bet365" | "Betfair";
  odds: Array<{ id: number; name: string; values: Array<{ value: string; odd: string }> }>;
  syncedAt: string;
};
