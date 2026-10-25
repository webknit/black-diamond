import type { Prediction } from "@black-diamond/core/prediction";
import { getDatabase } from "../../mongodb.js";

export async function getPredictionsForFixtures(
  fixtureIds: number[],
): Promise<Prediction[]> {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<Prediction>("predictions")
    .find({ fixtureId: { $in: fixtureIds } })
    .toArray();
}
