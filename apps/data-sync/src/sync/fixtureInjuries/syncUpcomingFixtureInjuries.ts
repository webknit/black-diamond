import type { FixtureInjury } from "@black-diamond/core/fixtureInjuries";
import { upsertFixtureInjuries } from "@black-diamond/database/fixtureInjuries";
import { getFixturesBetweenDates } from "@black-diamond/database/fixtures";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixtureInjuriesResponse } from "../../providers/api-football/types/fixtureInjuries.js";

const maximumFixtureIdsPerRequest = 20;
const daysAhead = 7;

function groupFixtureIds(fixtureIds: number[]): number[][] {
  return Array.from(
    { length: Math.ceil(fixtureIds.length / maximumFixtureIdsPerRequest) },
    (_, index) => fixtureIds.slice(index * maximumFixtureIdsPerRequest, (index + 1) * maximumFixtureIdsPerRequest),
  );
}

export async function syncUpcomingFixtureInjuries(now = new Date()): Promise<number> {
  const fixtures = await getFixturesBetweenDates(getUtcDateString(now), getUtcDateString(now, daysAhead + 1));
  const fixtureIds = fixtures
    .filter((fixture) => fixture.fixture.status.short === "NS" && fixture.fixture.timestamp * 1000 > now.getTime())
    .map((fixture) => fixture.fixture.id);
  const apiFootball = getApiFootballClient();
  const injuriesByFixtureId = new Map<number, FixtureInjury[]>(fixtureIds.map((fixtureId) => [fixtureId, []]));

  for (const ids of groupFixtureIds(fixtureIds)) {
    const response = await apiFootball.get<ApiFootballFixtureInjuriesResponse>("/injuries", {
      ids: ids.join("-"),
    });

    for (const injury of response.response) {
      const fixtureInjuries = injuriesByFixtureId.get(injury.fixture.id);
      if (!fixtureInjuries) continue;

      fixtureInjuries.push({ player: injury.player, team: injury.team });
    }
  }

  const syncedAt = new Date().toISOString();
  await Promise.all(
    [...injuriesByFixtureId].map(([fixtureId, injuries]) =>
      upsertFixtureInjuries({ fixtureId, injuries, syncedAt }),
    ),
  );

  return fixtureIds.length;
}
