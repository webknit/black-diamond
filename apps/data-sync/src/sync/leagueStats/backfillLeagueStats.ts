import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { getFixtureSeasonsForLeague } from "@black-diamond/database/fixtures";
import { getLeagueById } from "@black-diamond/database/leagues";
import { syncLeagueStatsForLeague } from "./syncLeagueStatsForLeague.js";

export async function backfillLeagueStats(): Promise<void> {
  for (const selectedLeague of selectedLeagues) {
    const league = await getLeagueById(selectedLeague.id);

    if (!league) {
      throw new Error(
        `Cannot backfill league stats: league ID ${selectedLeague.id} is not in MongoDB`,
      );
    }

    const storedSeasons = await getFixtureSeasonsForLeague(selectedLeague.id);

    for (const seasonYear of storedSeasons) {
      await syncLeagueStatsForLeague(selectedLeague.id, seasonYear);
    }
  }
}
