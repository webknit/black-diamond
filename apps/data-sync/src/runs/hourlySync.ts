import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";
import { syncLeagueStandings } from "../sync/standings/syncLeagueStandings.js";

export async function runHourlySync() {
  const fixturesInProgress = await syncFixturesInProgress();
  const leagueIdsInProgress = new Set(
    fixturesInProgress.map((fixture) => fixture.league.id),
  );

  for (const leagueId of leagueIdsInProgress) {
    await syncLeagueStandings(leagueId);
  }
}
