import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

const terminalFixtureStatuses = [
  "FT",
  "AET",
  "PEN",
  "PST",
  "CANC",
  "ABD",
  "AWD",
  "WO",
];

export async function getFixturesAwaitingResult(
  now = new Date(),
): Promise<Fixture[]> {
  const database = await getDatabase();
  const nowTimestamp = Math.floor(now.getTime() / 1000);
  const fortyEightHoursAgoTimestamp = nowTimestamp - 48 * 60 * 60;

  return database
    .collection<Fixture>("fixtures")
    .find({
      "fixture.timestamp": {
        $gte: fortyEightHoursAgoTimestamp,
        $lte: nowTimestamp,
      },
      "fixture.status.short": { $nin: terminalFixtureStatuses },
    })
    .toArray();
}
