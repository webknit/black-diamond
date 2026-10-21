import type { LeagueTeam } from "@black-diamond/core/team";

import { getDatabase } from "../../mongodb.js";

const LEAGUE_TEAMS_COLLECTION = "leagueTeams";

export async function upsertLeagueTeam(leagueTeam: LeagueTeam) {
  const database = await getDatabase();

  return database.collection<LeagueTeam>(LEAGUE_TEAMS_COLLECTION).updateOne(
    leagueTeam,
    { $set: leagueTeam },
    { upsert: true },
  );
}
