import { syncFixtures } from "../sync/fixtures/syncFixtures.js";
import { syncSelectedLeagues } from "../sync/leagues/syncSelectedLeagues.js";
import { syncStandings } from "../sync/standings/syncStandings.js";
import { syncTeams } from "../sync/teams/syncTeams.js";

export async function runDailySync() {
  await syncSelectedLeagues();
  await syncTeams();
  await syncFixtures();
  await syncStandings();
}
