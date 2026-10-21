import { selectedLeagues } from "../config/selectedLeagues.js";
import { syncTeamStatsForLeague } from "../sync/teamStats/syncTeamStatsForLeague.js";

export async function runWeeklySync() {
  for (const league of selectedLeagues) await syncTeamStatsForLeague(league.id);
}
