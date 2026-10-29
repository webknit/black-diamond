export type BotdDayFixture = {
  fixtureId: number;
  matches: Array<{ strategyId: string; referenceOdd: number | null }>;
  hasLeagueTable: boolean;
};

/** Ready-to-render BotD candidates for one UK calendar day. */
export type BotdDay = {
  fixtureDate: string;
  fixtures: BotdDayFixture[];
  updatedAt: string;
};
