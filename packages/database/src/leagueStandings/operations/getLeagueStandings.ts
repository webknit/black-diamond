import type { LeagueStandings } from "@black-diamond/core/leagueStandings";

import { getDatabase } from "../../mongodb.js";

export async function getLeagueStandings(
  leagueId: number,
  season: number,
): Promise<LeagueStandings | null> {
  const database = await getDatabase();

  return database.collection<LeagueStandings>("leagueStandings").findOne({
    "league.id": leagueId,
    "league.season": season,
  });
}
