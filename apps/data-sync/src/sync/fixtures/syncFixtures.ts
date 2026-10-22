import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncCurrentSeasonFixtures } from "./syncCurrentSeasonFixtures.js";

export async function syncFixtures() {
  for (const league of selectedLeagues) {
    await syncCurrentSeasonFixtures(league.id);
  }
}
