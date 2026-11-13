import { syncFixtures } from "../sync/fixtures/syncFixtures";
import { syncLeagueStats } from "../sync/leagueStats/syncLeagueStats";
import { syncSelectedLeagues } from "../sync/leagues/syncSelectedLeagues";
import { syncStandings } from "../sync/standings/syncStandings";
import { syncTeams } from "../sync/teams/syncTeams";
import { syncTeamStatsForTodaysFixtures } from "../sync/teamStats/syncTeamStatsForTodaysFixtures";
import { syncUpcomingPredictions } from "../sync/predictions/syncUpcomingPredictions";
import { syncFixtureStatsSnapshots } from "../sync/fixtureStatsSnapshots/syncFixtureStatsSnapshots";
import { syncBotdFixtures } from "../sync/botdFixtures/syncBotdFixtures";
import { syncBetResults } from "../sync/bets/syncBetResults";
import { syncStrategyPerformances } from "../sync/strategyPerformances/syncStrategyPerformances";
import { syncUpcomingFixtureInjuries } from "../sync/fixtureInjuries/syncUpcomingFixtureInjuries";
import { getFixtureRecoveryDateRange } from "../sync/fixtures/syncCurrentSeasonFixtures";
import { logSyncStep } from "../utils/logging/logSyncStep";

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
  await logSyncStep("sync BotD fixtures", syncBotdFixtures);
  await logSyncStep("sync league stats", syncLeagueStats);
  await logSyncStep("sync standings", syncStandings);
  await logSyncStep("sync strategy performances", syncStrategyPerformances);
}
