import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

/** Reads upcoming not-started fixtures through the timestamp/status index. */
export async function getUpcomingFixtures(now: Date, daysAhead: number): Promise<Fixture[]> {
  const nowTimestamp = now.getTime() / 1000;
  const endTimestamp = nowTimestamp + daysAhead * 24 * 60 * 60;
  return (await getDatabase()).collection<Fixture>("fixtures").find({
    "fixture.timestamp": { $gt: nowTimestamp, $lte: endTimestamp },
    "fixture.status.short": "NS",
  }, {
    // BotD only needs these fields to identify and group upcoming fixtures.
    // Avoid loading the full API fixture payload for every league into memory.
    projection: {
      _id: 0,
      "fixture.id": 1,
      "fixture.timestamp": 1,
      "fixture.status.short": 1,
      "league.id": 1,
    },
  }).toArray();
}
