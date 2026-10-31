import type { TeamStats } from "@black-diamond/core/teamStats";

import { getDatabase } from "../../mongodb.js";

export async function getTeamStats(
  teamId: number,
  leagueId: number,
  season: number,
): Promise<TeamStats | null> {
  return (await getDatabase()).collection<TeamStats>("teamStats").findOne({
    "team.id": teamId,
    "league.id": leagueId,
    "league.season": season,
  }, { projection: { _id: 0 } });
}
