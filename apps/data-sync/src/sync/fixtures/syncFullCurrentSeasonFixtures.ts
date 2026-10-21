import { getLeagueById } from "@black-diamond/database/leagues";
import { upsertFixtures } from "@black-diamond/database/fixtures";

import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixturesResponse } from "../../providers/api-football/types/fixtures.js";

export async function syncFullCurrentSeasonFixtures(leagueId: number) {
  const league = await getLeagueById(leagueId);

  if (!league) {
    throw new Error(
      `Cannot sync fixtures: league ID ${leagueId} is not in MongoDB`,
    );
  }

  const currentSeason = league.seasons.find((season) => season.current);

  if (!currentSeason) {
    throw new Error(
      `Cannot sync fixtures: league ID ${leagueId} has no current season`,
    );
  }

  const apiFootball = getApiFootballClient();
  const response = await apiFootball.get<ApiFootballFixturesResponse>(
    "/fixtures",
    {
      league: leagueId,
      season: currentSeason.year,
    },
  );

  await upsertFixtures(response.response);

  return {
    leagueId,
    season: currentSeason.year,
    fixturesSynced: response.response.length,
  };
}
