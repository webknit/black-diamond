import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";
import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";
export async function getFixtureStatsSnapshot(fixture: Fixture) {
  return (await getDatabase()).collection<FixtureStatsSnapshot>("fixtureStatsSnapshots").findOne({
    fixtureId: fixture.fixture.id,
    fixtureDateAtSnapshot: fixture.fixture.date,
  });
}
