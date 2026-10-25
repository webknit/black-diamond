import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";
import { syncFixtureEvents } from "../sync/fixtureEvents/syncFixtureEvents.js";
import { syncBetResults } from "../sync/bets/syncBetResults.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";

export async function runLiveSync() {
  const fixtures = await logSyncStep("refresh live fixtures", syncFixturesInProgress);
  await logSyncStep("sync live fixture events", () =>
    syncFixtureEvents(fixtures.map((fixture) => fixture.fixture.id)),
  );
  await logSyncStep("settle completed bets", syncBetResults);
}
