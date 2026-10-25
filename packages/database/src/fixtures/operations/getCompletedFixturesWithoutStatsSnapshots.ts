import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

const completedFixtureStatuses = ["FT", "AET", "PEN"];

export async function getCompletedFixturesWithoutStatsSnapshots(
  leagueIds: number[],
): Promise<Fixture[]> {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();

  return database
    .collection<Fixture>("fixtures")
    .aggregate<Fixture>([
      {
        $match: {
          "league.id": { $in: leagueIds },
          "fixture.status.short": { $in: completedFixtureStatuses },
        },
      },
      {
        $lookup: {
          from: "fixtureStatsSnapshots",
          localField: "fixture.id",
          foreignField: "fixtureId",
          as: "matchingSnapshots",
        },
      },
      { $match: { matchingSnapshots: { $eq: [] } } },
      { $sort: { "fixture.timestamp": 1 } },
      { $project: { matchingSnapshots: 0 } },
    ])
    .toArray();
}
