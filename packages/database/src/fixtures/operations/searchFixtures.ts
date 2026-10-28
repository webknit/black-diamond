import type { Fixture } from "@black-diamond/core/fixture";

import { getDatabase } from "../../mongodb.js";

export async function searchFixtures(query: string, limit = 8): Promise<Fixture[]> {
  const value = query.trim();
  if (!value) return [];

  const database = await getDatabase();
  const expression = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const recentFinishedCutoff = Math.floor(Date.now() / 1000) - 48 * 60 * 60;
  return database
    .collection<Fixture>("fixtures")
    .aggregate<Fixture>([
      {
        $match: {
          $or: [
            { "teams.home.name": expression },
            { "teams.away.name": expression },
            { "league.name": expression },
          ],
        },
      },
      {
        $addFields: {
          searchStatusOrder: {
            $switch: {
              branches: [
                { case: { $in: ["$fixture.status.short", ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"]] }, then: 0 },
                {
                  case: {
                    $and: [
                      { $in: ["$fixture.status.short", ["FT", "AET", "PEN"]] },
                      { $gte: ["$fixture.timestamp", recentFinishedCutoff] },
                    ],
                  },
                  then: 1,
                },
                { case: { $eq: ["$fixture.status.short", "NS"] }, then: 2 },
              ],
              default: 3,
            },
          },
          searchTimestampOrder: {
            $cond: [
              { $eq: ["$fixture.status.short", "NS"] },
              "$fixture.timestamp",
              { $multiply: ["$fixture.timestamp", -1] },
            ],
          },
        },
      },
      { $sort: { searchStatusOrder: 1, searchTimestampOrder: 1 } },
      { $limit: limit },
    ])
    .toArray();
}
