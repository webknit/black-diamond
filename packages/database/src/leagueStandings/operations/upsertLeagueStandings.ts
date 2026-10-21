import type { LeagueStandings } from "@black-diamond/core/leagueStandings";

import { getDatabase } from "../../mongodb.js";

export async function upsertLeagueStandings(standings: LeagueStandings) {
  const database = await getDatabase();

  return database.collection<LeagueStandings>("leagueStandings").updateOne(
    {
      "league.id": standings.league.id,
      "league.season": standings.league.season,
    },
    { $set: standings },
    { upsert: true },
  );
}
