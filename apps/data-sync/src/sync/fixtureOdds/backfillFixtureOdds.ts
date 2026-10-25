import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import {
  getFixturesBetweenDates,
} from "@black-diamond/database/fixtures";
import { getFixtureOddsForFixtures } from "@black-diamond/database/fixtureOdds";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";
import { syncFixtureOdds } from "./syncFixtureOdds.js";

const completedFixtureStatuses = new Set(["FT", "AET", "PEN"]);
const oddsHistoryDays = 7;

export async function backfillFixtureOdds(now = new Date()): Promise<number> {
  const selectedLeagueIds = new Set<number>(selectedLeagues.map((league) => league.id));
  const fixtures = await getFixturesBetweenDates(
    getUtcDateString(now, -oddsHistoryDays),
    getUtcDateString(now, 1),
  );
  const eligibleFixtures = fixtures.filter(
    (fixture) =>
      selectedLeagueIds.has(fixture.league.id) &&
      completedFixtureStatuses.has(fixture.fixture.status.short) &&
      fixture.fixture.timestamp * 1000 <= now.getTime(),
  );
  const existingOdds = await getFixtureOddsForFixtures(
    eligibleFixtures.map((fixture) => fixture.fixture.id),
  );
  const fixtureIdsWithOdds = new Set(existingOdds.map((odds) => odds.fixtureId));
  const fixturesMissingOdds = eligibleFixtures.filter(
    (fixture) => !fixtureIdsWithOdds.has(fixture.fixture.id),
  );

  for (const fixture of fixturesMissingOdds) {
    await syncFixtureOdds(fixture.fixture.id);
  }

  return fixturesMissingOdds.length;
}
