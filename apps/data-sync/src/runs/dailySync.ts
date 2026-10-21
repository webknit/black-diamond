import { syncFixtures } from "../sync/fixtures/syncFixtures.js";
import { syncLeagueStats } from "../sync/leagueStats/syncLeagueStats.js";
import { syncSelectedLeagues } from "../sync/leagues/syncSelectedLeagues.js";
import { syncStandings } from "../sync/standings/syncStandings.js";
import { syncTeams } from "../sync/teams/syncTeams.js";
import { syncTeamStatsForTodaysFixtures } from "../sync/teamStats/syncTeamStatsForTodaysFixtures.js";
import { syncUpcomingPredictions } from "../sync/predictions/syncUpcomingPredictions.js";
import { syncFixtureStatsSnapshots } from "../sync/fixtureStatsSnapshots/syncFixtureStatsSnapshots.js";
import { logSyncStep } from "../utils/logSyncStep.js";

export async function runDailySync() {
  await logSyncStep("sync selected leagues", syncSelectedLeagues);
  await logSyncStep("sync teams", syncTeams);
  await logSyncStep("sync fixtures", syncFixtures);
  await logSyncStep("sync fixture stats snapshots", syncFixtureStatsSnapshots);
  await logSyncStep("sync team stats for today's fixtures", syncTeamStatsForTodaysFixtures);
  await logSyncStep("sync upcoming predictions", syncUpcomingPredictions);
  await logSyncStep("sync league stats", syncLeagueStats);
  await logSyncStep("sync standings", syncStandings);
}
