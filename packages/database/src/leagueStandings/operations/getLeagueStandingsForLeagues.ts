import type { LeagueStandings } from "@black-diamond/core/leagueStandings";

import { getDatabase } from "../../mongodb.js";

export async function getLeagueStandingsForLeagues(
  leagueIds: number[],
): Promise<LeagueStandings[]> {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();

  return database
    .collection<LeagueStandings>("leagueStandings")
    .find(
      { "league.id": { $in: leagueIds } },
      { projection: { _id: 0 } },
    )
    .toArray();
}
