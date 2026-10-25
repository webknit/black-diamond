import {
  getFixturesAwaitingResult,
  upsertFixtures,
} from "@black-diamond/database/fixtures";

import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixturesResponse } from "../../providers/api-football/types/fixtures.js";

export async function syncFixturesInProgress() {
  const apiFootball = getApiFootballClient();
  const fixturesAwaitingResult = await getFixturesAwaitingResult();
  const fixtureIds = fixturesAwaitingResult.map((fixture) => fixture.fixture.id);
  const refreshedFixtures = await fetchFixturesByIds(apiFootball, fixtureIds);

  await upsertFixtures(refreshedFixtures);

  return refreshedFixtures;
}

async function fetchFixturesByIds(
  apiFootball: ReturnType<typeof getApiFootballClient>,
  fixtureIds: number[],
) {
  const batches = Array.from(
    { length: Math.ceil(fixtureIds.length / 20) },
    (_, index) => fixtureIds.slice(index * 20, index * 20 + 20),
  );
  const responses = await Promise.all(
    batches.map((fixtureIds) =>
      apiFootball.get<ApiFootballFixturesResponse>("/fixtures", {
        ids: fixtureIds.join("-"),
      }),
    ),
  );

  return responses.flatMap((response) => response.response);
}
