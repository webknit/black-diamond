import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncLeague } from "./syncLeague.js";

export async function syncSelectedLeagues() {
  for (const league of selectedLeagues) {
    const syncedLeague = await syncLeague(league);
  }
}
