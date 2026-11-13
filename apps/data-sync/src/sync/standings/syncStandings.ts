import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncLeagueStandings } from "./syncLeagueStandings";

export async function syncStandings() {
  for (const league of selectedLeagues) {
    await syncLeagueStandings(league.id);
  }
}
