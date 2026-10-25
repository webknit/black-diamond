import type { LeagueStats } from "@black-diamond/core/leagueStats";

import { getDatabase } from "../../mongodb.js";

export async function getLeagueStats(leagueIds: number[]): Promise<LeagueStats[]> {
  if (leagueIds.length === 0) return [];

  const database = await getDatabase();

  return database
    .collection<LeagueStats>("leagueStats")
    .aggregate<LeagueStats>([
      {
        $match: {
          "league.id": { $in: leagueIds },
          round: { $exists: true },
        },
      },
      { $sort: { "league.season": -1, roundLastFixtureTimestamp: -1 } },
      { $group: { _id: "$league.id", stats: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$stats" } },
      { $project: { _id: 0 } },
    ])
    .toArray();
}
