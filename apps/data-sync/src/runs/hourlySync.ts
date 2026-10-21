import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";
import { syncLeagueStandings } from "../sync/standings/syncLeagueStandings.js";
import { syncPrediction } from "../sync/predictions/syncPrediction.js";
import { logSyncStep } from "../utils/logSyncStep.js";

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
