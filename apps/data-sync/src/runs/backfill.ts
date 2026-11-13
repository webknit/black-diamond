import { backfillFixtureOdds } from "../sync/fixtureOdds/backfillFixtureOdds";
import { backfillLeagueStats } from "../sync/leagueStats/backfillLeagueStats";
import { syncStrategyPerformances } from "../sync/strategyPerformances/syncStrategyPerformances";
import { syncBotdFixtures } from "../sync/botdFixtures/syncBotdFixtures";
import { logSyncStep } from "../utils/logging/logSyncStep";
import { runFixtureStatsSnapshotBackfill } from "./backfillFixtureStatsSnapshots";

export async function runBackfill(): Promise<void> {
  await runFixtureStatsSnapshotBackfill();
  await logSyncStep("backfill league stats", backfillLeagueStats);
  await logSyncStep("backfill recent missing pre-match odds", backfillFixtureOdds);
  await logSyncStep("sync BotD fixtures", syncBotdFixtures);
  await logSyncStep("backfill strategy performances", syncStrategyPerformances);
}
