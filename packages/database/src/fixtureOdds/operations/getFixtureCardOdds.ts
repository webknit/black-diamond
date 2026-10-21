import type { FixtureOdds } from "@black-diamond/core/fixtureOdds";
import { getDatabase } from "../../mongodb.js";

type FixtureCardOdds = {
  fixtureId: number;
  odds: Array<{ name: string; values: Array<{ value: string; odd: string }> }>;
};

export async function getFixtureCardOdds(fixtureIds: number[]) {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureOdds>("fixtureOdds")
    .find<FixtureCardOdds>(
      { fixtureId: { $in: fixtureIds } },
      {
        projection: {
          _id: 0,
          fixtureId: 1,
          "odds.name": 1,
          "odds.values.value": 1,
          "odds.values.odd": 1,
        },
      },
    )
    .toArray();
}
