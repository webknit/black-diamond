import { getFixturesBetweenDates } from "@black-diamond/database/fixtures";
import { getFixtureOddsForFixtures } from "@black-diamond/database/fixtureOdds";
import { getUtcDateString } from "../../utils/time/getUtcDateString";
import { syncFixtureOdds } from "./syncFixtureOdds";

const oddsWindowMilliseconds = 3 * 24 * 60 * 60 * 1000;

export async function syncUpcomingFixtureOdds(now = new Date()) {
  const fixtures = await getFixturesBetweenDates(
    getUtcDateString(now),
    getUtcDateString(new Date(now.getTime() + oddsWindowMilliseconds), 1),
  );
  const upcomingFixtures = fixtures.filter(
    (fixture) =>
      fixture.fixture.status.short === "NS" &&
      fixture.fixture.timestamp * 1000 > now.getTime() &&
      fixture.fixture.timestamp * 1000 <= now.getTime() + oddsWindowMilliseconds,
  );
  const existingOdds = await getFixtureOddsForFixtures(
    upcomingFixtures.map((fixture) => fixture.fixture.id),
  );
  const fixtureIdsWithOdds = new Set(existingOdds.map((odds) => odds.fixtureId));

  for (const fixture of upcomingFixtures) {
    if (fixtureIdsWithOdds.has(fixture.fixture.id)) continue;

    try {
      await syncFixtureOdds(fixture.fixture.id);
    } catch (error) {
      console.error(
        `[data-sync] Stopped odds sync after fixture ${fixture.fixture.id} failed. The next scheduled run will retry.`,
        error,
      );

      // A provider-level error (rate limit, proxy page, temporary outage) is unlikely
      // to succeed for the remaining fixtures in this same run.
      return;
    }
  }
}
