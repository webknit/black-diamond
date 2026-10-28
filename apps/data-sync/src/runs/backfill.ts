import { backfillFixtureOdds } from "../sync/fixtureOdds/backfillFixtureOdds.js";
import { backfillLeagueStats } from "../sync/leagueStats/backfillLeagueStats.js";
import { syncStrategyPerformances } from "../sync/strategyPerformances/syncStrategyPerformances.js";
import { syncBotdFixtures } from "../sync/botdFixtures/syncBotdFixtures.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";
import { runFixtureStatsSnapshotBackfill } from "./backfillFixtureStatsSnapshots.js";

export async function runBackfill(): Promise<void> {
  await runFixtureStatsSnapshotBackfill();
  await logSyncStep("backfill league stats", backfillLeagueStats);
  await logSyncStep("backfill recent missing pre-match odds", backfillFixtureOdds);
  await logSyncStep("sync BotD fixtures", syncBotdFixtures);
  await logSyncStep("backfill strategy performances", syncStrategyPerformances);
}
