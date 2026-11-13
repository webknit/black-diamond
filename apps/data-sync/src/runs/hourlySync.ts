import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress";
import { syncLeagueStandings } from "../sync/standings/syncLeagueStandings";
import { syncPrediction } from "../sync/predictions/syncPrediction";
import { logSyncStep } from "../utils/logging/logSyncStep";

export async function runHourlySync() {
  const fixturesInProgress = await logSyncStep(
    "sync in-progress fixtures",
    syncFixturesInProgress,
  );
  const leagueIdsInProgress = new Set(
    fixturesInProgress.map((fixture) => fixture.league.id),
  );

  for (const leagueId of leagueIdsInProgress) {
    await logSyncStep(`sync standings for league ${leagueId}`, () =>
      syncLeagueStandings(leagueId),
    );
  }
  for (const fixture of fixturesInProgress) {
    await logSyncStep(`sync prediction for fixture ${fixture.fixture.id}`, () =>
      syncPrediction(fixture.fixture.id),
    );
  }
}
