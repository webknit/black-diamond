import { getFixturesBetweenDates } from "@black-diamond/database/fixtures";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";
import { syncFixtureOdds } from "./syncFixtureOdds.js";
export async function syncUpcomingFixtureOdds(now = new Date()) {
  const fixtures = await getFixturesBetweenDates(getUtcDateString(now), getUtcDateString(now, 8));
  for (const fixture of fixtures) await syncFixtureOdds(fixture.fixture.id);
}
