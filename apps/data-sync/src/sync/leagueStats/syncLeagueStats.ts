import { selectedLeagues } from "../../config/selectedLeagues.js";
import { syncLeagueStatsForLeague } from "./syncLeagueStatsForLeague.js";

export async function syncLeagueStats() {
  for (const league of selectedLeagues) {
    await syncLeagueStatsForLeague(league.id);
  }
}
