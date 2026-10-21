import { getFixturesBetweenDates } from "@black-diamond/database/fixtures";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";
import { syncFixtureStatsSnapshot } from "./syncFixtureStatsSnapshot.js";
export async function syncFixtureStatsSnapshots(now = new Date()) {
  const fixtures = await getFixturesBetweenDates(getUtcDateString(now), getUtcDateString(now, 8));
  const nowTimestamp = now.getTime() / 1000;
  const endTimestamp = nowTimestamp + 7 * 24 * 60 * 60;

  for (const fixture of fixtures) {
    if (
      fixture.fixture.timestamp <= nowTimestamp ||
      fixture.fixture.timestamp > endTimestamp ||
      fixture.fixture.status.short !== "NS"
    ) continue;
    await syncFixtureStatsSnapshot(fixture);
  }
}
