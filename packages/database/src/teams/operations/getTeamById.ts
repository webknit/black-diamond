import type { Team } from "@black-diamond/core/team";

import { getDatabase } from "../../mongodb.js";

export async function getTeamById(teamId: number): Promise<Team | null> {
  return (await getDatabase())
    .collection<Team>("teams")
    .findOne({ "team.id": teamId }, { projection: { _id: 0 } });
}
