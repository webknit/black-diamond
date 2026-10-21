import { selectedLeagues } from "../../config/selectedLeagues.js";
import { syncLeagueStandings } from "./syncLeagueStandings.js";

export async function syncStandings() {
  for (const league of selectedLeagues) {
    await syncLeagueStandings(league.id);
  }
}
