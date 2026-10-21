import type { League } from "@black-diamond/core/league";

import { getDatabase } from "../../mongodb.js";

const LEAGUES_COLLECTION = "leagues";

export async function upsertLeague(league: League) {
  const database = await getDatabase();

  return database.collection<League>(LEAGUES_COLLECTION).updateOne(
    { "league.id": league.league.id },
    { $set: league },
    { upsert: true },
  );
}
