import type { League } from "@black-diamond/core/league";

import { getDatabase } from "../../mongodb.js";

const LEAGUES_COLLECTION = "leagues";

export async function getLeagueById(leagueId: number): Promise<League | null> {
  const database = await getDatabase();

  return database
    .collection<League>(LEAGUES_COLLECTION)
    .findOne({ "league.id": leagueId });
}
