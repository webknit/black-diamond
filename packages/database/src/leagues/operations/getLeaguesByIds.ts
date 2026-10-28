import type { League } from "@black-diamond/core/league";

import { getDatabase } from "../../mongodb.js";

const LEAGUES_COLLECTION = "leagues";

export async function getLeaguesByIds(leagueIds: number[]): Promise<League[]> {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<League>(LEAGUES_COLLECTION)
    .find({ "league.id": { $in: leagueIds } })
    .toArray();
}
