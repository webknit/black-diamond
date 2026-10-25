import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { getCompletedFixturesWithoutStatsSnapshots } from "@black-diamond/database/fixtures";
import { syncFixtureStatsSnapshot } from "./syncFixtureStatsSnapshot.js";

export async function backfillFixtureStatsSnapshots(): Promise<number> {
  const fixtures = await getCompletedFixturesWithoutStatsSnapshots(
    selectedLeagues.map((league) => league.id),
  );

  for (const fixture of fixtures) {
    await syncFixtureStatsSnapshot(fixture);
  }

  return fixtures.length;
}
