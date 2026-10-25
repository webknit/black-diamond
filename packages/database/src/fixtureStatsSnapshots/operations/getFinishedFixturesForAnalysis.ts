import type { Fixture } from "@black-diamond/core/fixture";
import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";
import { getDatabase } from "../../mongodb.js";

export type FinishedFixtureForAnalysis = Fixture & {
  fixtureStatsSnapshot: FixtureStatsSnapshot | null;
};

export async function getFinishedFixturesForAnalysis(leagueIds: number[]) {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<Fixture>("fixtures")
    .aggregate<FinishedFixtureForAnalysis>([
      {
        $match: {
          "league.id": { $in: leagueIds },
          "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
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
      {
        $set: {
          fixtureStatsSnapshot: { $arrayElemAt: ["$matchingSnapshots", 0] },
        },
      },
      { $project: { matchingSnapshots: 0 } },
      { $sort: { "fixture.timestamp": 1 } },
    ])
    .toArray();
}
