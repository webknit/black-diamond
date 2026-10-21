import { upsertPrediction } from "@black-diamond/database/predictions";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
export async function syncPrediction(fixtureId: number) {
  const response = await getApiFootballClient().get<{ response: Record<string, unknown>[] }>("/predictions", { fixture: fixtureId });
  const prediction = response.response[0];
  if (prediction) await upsertPrediction({ fixtureId, response: prediction });
}
