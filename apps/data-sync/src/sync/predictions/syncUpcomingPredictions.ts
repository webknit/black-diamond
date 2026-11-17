import { getFixturesBetweenDates } from "@black-diamond/database/fixtures";
import { getPredictionsForFixtures } from "@black-diamond/database/predictions";
import { getUtcDateString } from "../../utils/time/getUtcDateString";
import { syncPrediction } from "./syncPrediction";

export async function syncUpcomingPredictions(now = new Date()) {
  const fixtures = await getFixturesBetweenDates(getUtcDateString(now), getUtcDateString(now, 8));
  const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
  const existingPredictions = await getPredictionsForFixtures(fixtureIds);
  const fixtureIdsWithPredictions = new Set(
    existingPredictions.map((prediction) => prediction.fixtureId),
  );

  for (const fixture of fixtures) {
    if (fixtureIdsWithPredictions.has(fixture.fixture.id)) continue;
    await syncPrediction(fixture.fixture.id);
  }
}
