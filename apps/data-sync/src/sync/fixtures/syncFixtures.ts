import { selectedLeagues } from "../../config/selectedLeagues.js";
import { syncCurrentSeasonFixtures } from "./syncCurrentSeasonFixtures.js";

export async function syncFixtures() {
  for (const league of selectedLeagues) {
    await syncCurrentSeasonFixtures(league.id);
  }
}
