import type { Prediction } from "@black-diamond/core/prediction";
import { getDatabase } from "../../mongodb.js";
export async function upsertPrediction(prediction: Prediction) {
  const database = await getDatabase();
  await database.collection<Prediction>("predictions").updateOne(
    { fixtureId: prediction.fixtureId }, { $set: prediction }, { upsert: true },
  );
}
