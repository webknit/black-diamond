import { getFixturesBetweenDates } from "@black-diamond/database/fixtures";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";
import { syncFixtureOdds } from "./syncFixtureOdds.js";
export async function syncUpcomingFixtureOdds(now = new Date()) {
  const fixtures = await getFixturesBetweenDates(getUtcDateString(now), getUtcDateString(now, 8));
  for (const fixture of fixtures) {
    if (
      fixture.fixture.status.short !== "NS" ||
      fixture.fixture.timestamp * 1000 <= now.getTime()
    ) {
      continue;
    }

    await syncFixtureOdds(fixture.fixture.id);
  }
}
