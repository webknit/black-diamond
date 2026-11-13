import { syncUpcomingFixtureOdds } from "../sync/fixtureOdds/syncUpcomingFixtureOdds";
import { syncBotdFixtures } from "../sync/botdFixtures/syncBotdFixtures";
import { logSyncStep } from "../utils/logging/logSyncStep";

export async function runThreeHourlySync() {
  await logSyncStep("sync upcoming fixture odds", syncUpcomingFixtureOdds);
  await logSyncStep("sync BotD fixtures", syncBotdFixtures);
}
