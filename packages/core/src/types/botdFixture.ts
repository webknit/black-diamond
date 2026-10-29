import type { Fixture } from "./fixture.js";
import type { FixtureInjury } from "./fixtureInjuries.js";
import type { FixtureTeamLineup } from "./fixtureLineups.js";
import type { FixtureOdds } from "./fixtureOdds.js";
import type { FixtureStatsSnapshot } from "./fixtureStatsSnapshot.js";

/** A precomputed BotD card, rebuilt from the source collections as fixtures change. */
export type BotdFixture = {
  fixtureId: number;
  /** UK calendar date of the fixture, used by the BotD date picker. */
  fixtureDate: string;
  /** Stored pre-match Over 2.5 price, or null when the provider had none. */
  over2_5ReferenceOdd: number | null;
  matchingStrategyIds: string[];
  fixture: Fixture;
  statsSnapshot: FixtureStatsSnapshot;
  odds: FixtureOdds["odds"];
  prediction: Record<string, unknown> | null;
  injuries: FixtureInjury[] | null;
  lineups: FixtureTeamLineup[] | null;
  hasLeagueTable: boolean;
  updatedAt: string;
};
