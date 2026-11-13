import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncLeague } from "./syncLeague";

export async function syncSelectedLeagues() {
  for (const league of selectedLeagues) {
    const syncedLeague = await syncLeague(league);
  }
}
