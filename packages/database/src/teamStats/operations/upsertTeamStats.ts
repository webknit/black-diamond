import type { TeamStats } from "@black-diamond/core/teamStats";
import { getDatabase } from "../../mongodb.js";

export async function upsertTeamStats(stats: TeamStats): Promise<void> {
  const database = await getDatabase();
  await database.collection<TeamStats>("teamStats").updateOne(
    { "team.id": stats.team.id, "league.id": stats.league.id, "league.season": stats.league.season },
    { $set: stats },
    { upsert: true },
  );
}
