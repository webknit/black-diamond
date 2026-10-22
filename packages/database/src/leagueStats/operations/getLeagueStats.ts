import type { LeagueStats } from "@black-diamond/core/leagueStats";

import { getDatabase } from "../../mongodb.js";

export async function getLeagueStats(leagueIds: number[]): Promise<LeagueStats[]> {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();

  return database
    .collection<LeagueStats>("leagueStats")
    .find(
      { "league.id": { $in: leagueIds } },
      { projection: { _id: 0 } },
    )
    .toArray();
}
