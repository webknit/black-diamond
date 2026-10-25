import type { LeagueStats } from "@black-diamond/core/leagueStats";

import { getDatabase } from "../../mongodb.js";

export async function upsertLeagueStats(stats: LeagueStats): Promise<void> {
  const database = await getDatabase();

  await database.collection<LeagueStats>("leagueStats").updateOne(
    {
      "league.id": stats.league.id,
      "league.season": stats.league.season,
      round: stats.round,
    },
    { $set: stats },
    { upsert: true },
  );
}
