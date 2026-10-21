import type { LeagueTeam } from "@black-diamond/core/team";
import { getDatabase } from "../../mongodb.js";

export async function getLeagueTeams(leagueId: number, season: number) {
  const database = await getDatabase();
  return database.collection<LeagueTeam>("leagueTeams").find({ leagueId, season }).toArray();
}
