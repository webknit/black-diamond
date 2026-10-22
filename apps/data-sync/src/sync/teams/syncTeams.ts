import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncLeagueTeams } from "./syncLeagueTeams.js";

export async function syncTeams() {
  for (const league of selectedLeagues) {
    const result = await syncLeagueTeams(league.id);
  }
}
