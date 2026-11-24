import {
  getFixturesBefore,
  getFixturesBetweenDates,
} from "@black-diamond/database/fixtures";
import { getUtcDateString } from "../../utils/time/getUtcDateString";
import { syncFixtureStatsSnapshot } from "./syncFixtureStatsSnapshot";
export async function syncFixtureStatsSnapshots(now = new Date()) {
  const fixtures = await getFixturesBetweenDates(getUtcDateString(now), getUtcDateString(now, 8));
  const nowTimestamp = now.getTime() / 1000;
  const endTimestamp = nowTimestamp + 7 * 24 * 60 * 60;

  const upcomingFixtures = fixtures.filter(
    (fixture) =>
      fixture.fixture.timestamp > nowTimestamp &&
      fixture.fixture.timestamp <= endTimestamp &&
      fixture.fixture.status.short === "NS",
  );
  const fixturesByLeagueSeason = new Map<string, typeof upcomingFixtures>();
  for (const fixture of upcomingFixtures) {
    const key = `${fixture.league.id}-${fixture.league.season}`;
    const group = fixturesByLeagueSeason.get(key) ?? [];
    group.push(fixture);
    fixturesByLeagueSeason.set(key, group);
  }

  for (const leagueFixtures of fixturesByLeagueSeason.values()) {
    const latestFixture = leagueFixtures.reduce((latest, fixture) =>
      fixture.fixture.timestamp > latest.fixture.timestamp ? fixture : latest,
    );
    const priorFixtures = await getFixturesBefore(
      latestFixture.league.id,
      latestFixture.league.season,
      latestFixture.fixture.timestamp,
    );

    for (const fixture of leagueFixtures) {
      await syncFixtureStatsSnapshot(fixture, priorFixtures);
    }
  }
}
