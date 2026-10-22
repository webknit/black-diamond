import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncLeagueStatsForLeague } from "./syncLeagueStatsForLeague.js";

export async function syncLeagueStats() {
  for (const league of selectedLeagues) {
    await syncLeagueStatsForLeague(league.id);
  }
}
