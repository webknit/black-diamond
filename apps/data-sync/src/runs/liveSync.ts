import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";
import { syncFixtureEvents } from "../sync/fixtureEvents/syncFixtureEvents.js";
import { syncFixtureStatistics } from "../sync/fixtureStatistics/syncFixtureStatistics.js";
import { syncFixtureLineups } from "../sync/fixtureLineups/syncFixtureLineups.js";
import { syncBetResults } from "../sync/bets/syncBetResults.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";
import { getFixturesForLineupSync, getRecentlyFinishedFixtures } from "@black-diamond/database/fixtures";
import { getFixtureEventsForFixtures } from "@black-diamond/database/fixtureEvents";

function isApiFootballRateLimitError(error: unknown): error is { status: number } {
  return typeof error === "object" && error !== null && "status" in error && error.status === 429;
}

async function runOptionalLiveDataSync(label: string, work: () => Promise<unknown>) {
  try {
    await logSyncStep(label, work);
  } catch (error) {
    if (!isApiFootballRateLimitError(error)) throw error;
    console.warn(`[data-sync] Skipped ${label} after API-Football rate limiting. The next live sync will try again.`);
  }
}

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
  await runOptionalLiveDataSync("sync live fixture events", () =>
    syncFixtureEvents(eventFixtureIds),
  );
  const fixturesForStatistics = [...new Map([
    ...fixtures,
    ...recentlyFinishedFixtures,
  ].map((fixture) => [fixture.fixture.id, fixture])).values()];
  await runOptionalLiveDataSync("sync live fixture statistics", () =>
    syncFixtureStatistics(fixturesForStatistics),
  );
  const fixturesForLineupSync = await getFixturesForLineupSync();
  await runOptionalLiveDataSync("sync upcoming and live fixture lineups", () =>
    syncFixtureLineups(fixturesForLineupSync.map((fixture) => fixture.fixture.id)),
  );
  await logSyncStep("settle completed bets", syncBetResults);
}
