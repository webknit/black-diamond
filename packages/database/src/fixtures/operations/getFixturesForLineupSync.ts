import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

const terminalFixtureStatuses = ["FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO"];

export async function getFixturesForLineupSync(now = new Date()): Promise<Fixture[]> {
  const database = await getDatabase();
  const nowTimestamp = Math.floor(now.getTime() / 1000);

  return database.collection<Fixture>("fixtures").find({
    "fixture.timestamp": {
      $gte: nowTimestamp - 4 * 60 * 60,
      $lte: nowTimestamp + 90 * 60,
    },
    "fixture.status.short": { $nin: terminalFixtureStatuses },
  }).toArray();
}
