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

    try {
      await syncFixtureOdds(fixture.fixture.id);
    } catch (error) {
      console.error(
        `[data-sync] Stopped odds sync after fixture ${fixture.fixture.id} failed. The next scheduled run will retry.`,
        error,
      );

      // A provider-level error (rate limit, proxy page, temporary outage) is unlikely
      // to succeed for the remaining fixtures in this same run.
      return;
    }
  }
}
