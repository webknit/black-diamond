import type { Team } from "@black-diamond/core/team";

import { getDatabase } from "../../mongodb.js";

const TEAMS_COLLECTION = "teams";

export async function upsertTeam(team: Team) {
  const database = await getDatabase();

  return database.collection<Team>(TEAMS_COLLECTION).updateOne(
    { "team.id": team.team.id },
    { $set: team },
    { upsert: true },
  );
}
