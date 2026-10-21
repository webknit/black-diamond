import { syncFixtures } from "../sync/fixtures/syncFixtures.js";
import { syncLeagueStats } from "../sync/leagueStats/syncLeagueStats.js";
import { syncSelectedLeagues } from "../sync/leagues/syncSelectedLeagues.js";
import { syncStandings } from "../sync/standings/syncStandings.js";
import { syncTeams } from "../sync/teams/syncTeams.js";
import { syncTeamStatsForTodaysFixtures } from "../sync/teamStats/syncTeamStatsForTodaysFixtures.js";
import { syncUpcomingPredictions } from "../sync/predictions/syncUpcomingPredictions.js";
import { syncFixtureStatsSnapshots } from "../sync/fixtureStatsSnapshots/syncFixtureStatsSnapshots.js";

export async function runDailySync() {
  await syncSelectedLeagues();
  await syncTeams();
  await syncFixtures();
  await syncFixtureStatsSnapshots();
  await syncTeamStatsForTodaysFixtures();
  await syncUpcomingPredictions();
  await syncLeagueStats();
  await syncStandings();
}
