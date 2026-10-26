import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";
import { syncFixtureEvents } from "../sync/fixtureEvents/syncFixtureEvents.js";
import { syncFixtureStatistics } from "../sync/fixtureStatistics/syncFixtureStatistics.js";
import { syncBetResults } from "../sync/bets/syncBetResults.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";
import { getRecentlyFinishedFixtures } from "@black-diamond/database/fixtures";
import { getFixtureEventsForFixtures } from "@black-diamond/database/fixtureEvents";

export async function runLiveSync() {
  const fixtures = await logSyncStep("refresh live fixtures", syncFixturesInProgress);
  const recentlyFinishedFixtures = await getRecentlyFinishedFixtures();
  const recentlyFinishedIds = recentlyFinishedFixtures.map((fixture) => fixture.fixture.id);
  const existingEvents = await getFixtureEventsForFixtures(recentlyFinishedIds);
  const fixtureIdsMissingEvents = recentlyFinishedIds.filter(
    (fixtureId) => !existingEvents.some((fixtureEvents) => fixtureEvents.fixtureId === fixtureId),
  );
  const eventFixtureIds = [...new Set([
    ...fixtures.map((fixture) => fixture.fixture.id),
    ...fixtureIdsMissingEvents,
  ])];
  await logSyncStep("sync live fixture events", () =>
    syncFixtureEvents(eventFixtureIds),
  );
  const fixturesForStatistics = [...new Map([
    ...fixtures,
    ...recentlyFinishedFixtures,
  ].map((fixture) => [fixture.fixture.id, fixture])).values()];
  await logSyncStep("sync live fixture statistics", () =>
    syncFixtureStatistics(fixturesForStatistics),
  );
  await logSyncStep("settle completed bets", syncBetResults);
}
