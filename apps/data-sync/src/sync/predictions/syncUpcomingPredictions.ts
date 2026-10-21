import { getFixturesBetweenDates } from "@black-diamond/database/fixtures";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";
import { syncPrediction } from "./syncPrediction.js";
export async function syncUpcomingPredictions(now = new Date()) {
  const fixtures = await getFixturesBetweenDates(getUtcDateString(now), getUtcDateString(now, 8));
  for (const fixture of fixtures) await syncPrediction(fixture.fixture.id);
}
