import { syncUpcomingFixtureOdds } from "../sync/fixtureOdds/syncUpcomingFixtureOdds.js";
import { logSyncStep } from "../utils/logSyncStep.js";

export async function runThreeHourlySync() {
  await logSyncStep("sync upcoming fixture odds", syncUpcomingFixtureOdds);
}
