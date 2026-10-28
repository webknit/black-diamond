/** A precomputed match between a fixture and one or more BotD strategies. */
export type BotdFixture = {
  fixtureId: number;
  /** UK calendar date of the fixture, used by the BotD date picker. */
  fixtureDate: string;
  /** Stored pre-match Over 2.5 price, or null when the provider had none. */
  over2_5ReferenceOdd: number | null;
  matchingStrategyIds: string[];
  updatedAt: string;
};
