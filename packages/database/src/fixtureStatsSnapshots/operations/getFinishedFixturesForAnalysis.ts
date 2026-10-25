import type { Fixture } from "@black-diamond/core/fixture";
import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";
import { getDatabase } from "../../mongodb.js";

export type FinishedFixtureForAnalysis = Fixture & {
  fixtureStatsSnapshot: FixtureStatsSnapshot | null;
};

type LeagueSeason = { leagueId: number; season: number };

export async function getFinishedFixturesForAnalysis(
  leagueIds: number[],
  leagueSeasons?: LeagueSeason[],
) {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<Fixture>("fixtures")
    .aggregate<FinishedFixtureForAnalysis>([
      {
        $match: {
          "league.id": { $in: leagueIds },
          "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
          ...(leagueSeasons && leagueSeasons.length > 0
            ? {
                $or: leagueSeasons.map(({ leagueId, season }) => ({
                  "league.id": leagueId,
                  "league.season": season,
                })),
              }
            : {}),
        },
      },
      { $sort: { "fixture.timestamp": 1 } },
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
    ], { allowDiskUse: true })
    .toArray();
}
