import { upsertFixtures } from "@black-diamond/database/fixtures";

import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixturesResponse } from "../../providers/api-football/types/fixtures.js";

export async function syncFixturesInProgress() {
  const apiFootball = getApiFootballClient();
  const leagueIds = selectedLeagues.map((league) => league.id).join("-");
  const response = await apiFootball.get<ApiFootballFixturesResponse>("/fixtures", {
    live: leagueIds,
  });

  await upsertFixtures(response.response);

  return response.response;
}
