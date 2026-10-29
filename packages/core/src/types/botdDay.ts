export type BotdDayFixture = {
  fixtureId: number;
  matchingStrategyIds: string[];
  over2_5ReferenceOdd: number | null;
  hasLeagueTable: boolean;
};

/** Ready-to-render BotD candidates for one UK calendar day. */
export type BotdDay = {
  fixtureDate: string;
  fixtures: BotdDayFixture[];
  updatedAt: string;
};
