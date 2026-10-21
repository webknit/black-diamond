import { upsertLeagueStandings } from "@black-diamond/database/leagueStandings";
import { getLeagueById } from "@black-diamond/database/leagues";

import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballStandingsResponse } from "../../providers/api-football/types/standings.js";

export async function syncLeagueStandings(leagueId: number) {
  const league = await getLeagueById(leagueId);

  if (!league) {
    throw new Error(
      `Cannot sync standings: league ID ${leagueId} is not in MongoDB`,
    );
  }

  const currentSeason = league.seasons.find((season) => season.current);

  if (!currentSeason) {
    throw new Error(
      `Cannot sync standings: league ID ${leagueId} has no current season`,
    );
  }

  const apiFootball = getApiFootballClient();
  const response = await apiFootball.get<ApiFootballStandingsResponse>(
    "/standings",
    {
      league: leagueId,
      season: currentSeason.year,
    },
  );

  const standings = response.response[0];

  if (!standings) {
    throw new Error(
      `API-Football returned no standings for league ID ${leagueId} and season ${currentSeason.year}`,
    );
  }

  await upsertLeagueStandings(standings);

  return standings;
}
