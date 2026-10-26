import { syncFixtures } from "../sync/fixtures/syncFixtures.js";
import { syncLeagueStats } from "../sync/leagueStats/syncLeagueStats.js";
import { syncSelectedLeagues } from "../sync/leagues/syncSelectedLeagues.js";
import { syncStandings } from "../sync/standings/syncStandings.js";
import { syncTeams } from "../sync/teams/syncTeams.js";
import { syncTeamStatsForTodaysFixtures } from "../sync/teamStats/syncTeamStatsForTodaysFixtures.js";
import { syncUpcomingPredictions } from "../sync/predictions/syncUpcomingPredictions.js";
import { syncFixtureStatsSnapshots } from "../sync/fixtureStatsSnapshots/syncFixtureStatsSnapshots.js";
import { syncBetResults } from "../sync/bets/syncBetResults.js";
import { syncStrategyPerformances } from "../sync/strategyPerformances/syncStrategyPerformances.js";
import { syncUpcomingFixtureInjuries } from "../sync/fixtureInjuries/syncUpcomingFixtureInjuries.js";
import { getFixtureRecoveryDateRange } from "../sync/fixtures/syncCurrentSeasonFixtures.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";

export async function runDailySync(lastCompletedAt?: Date) {
  const fixtureDateRange = getFixtureRecoveryDateRange(lastCompletedAt);

  await logSyncStep("sync selected leagues", syncSelectedLeagues);
  await logSyncStep("sync teams", syncTeams);
  await logSyncStep("sync fixtures", () => syncFixtures(fixtureDateRange));
  await logSyncStep("settle completed bets", syncBetResults);
  await logSyncStep("sync fixture stats snapshots", syncFixtureStatsSnapshots);
  await logSyncStep("sync team stats for today's fixtures", syncTeamStatsForTodaysFixtures);
  await logSyncStep("sync upcoming predictions", syncUpcomingPredictions);
  await logSyncStep("sync upcoming fixture injuries", syncUpcomingFixtureInjuries);
  await logSyncStep("sync league stats", syncLeagueStats);
  await logSyncStep("sync standings", syncStandings);
  await logSyncStep("sync strategy performances", syncStrategyPerformances);
}
