import { selectedLeagues } from "../../config/selectedLeagues.js";
import { syncLeagueTeams } from "./syncLeagueTeams.js";

export async function syncTeams() {
  for (const league of selectedLeagues) {
    const result = await syncLeagueTeams(league.id);
  }
}
