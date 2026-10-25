import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

const snapshotEligibleFixtureStatuses = [
  "NS",
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "SUSP",
  "INT",
  "LIVE",
  "FT",
  "AET",
  "PEN",
];

export async function getFixturesForStatsSnapshotBackfill(leagueIds: number[]) {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<Fixture>("fixtures")
    .find({
      "league.id": { $in: leagueIds },
      "fixture.status.short": { $in: snapshotEligibleFixtureStatuses },
    })
    .sort({ "fixture.timestamp": 1 })
    .toArray();
}
