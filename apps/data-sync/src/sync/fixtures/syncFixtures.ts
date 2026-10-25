import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import type { FixtureDateRange } from "./syncLeagueFixtures.js";
import { syncCurrentSeasonFixtures } from "./syncCurrentSeasonFixtures.js";

export async function syncFixtures(dateRange?: FixtureDateRange) {
  for (const league of selectedLeagues) {
    if (dateRange) {
      await syncCurrentSeasonFixtures(league.id, dateRange);
    } else {
      await syncCurrentSeasonFixtures(league.id);
    }
  }
}
