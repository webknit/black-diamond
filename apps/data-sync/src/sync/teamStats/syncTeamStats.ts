import { upsertTeamStats } from "@black-diamond/database/teamStats";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballTeamStatisticsResponse } from "../../providers/api-football/types/teams.js";

export async function syncTeamStats(teamId: number, leagueId: number, season: number) {
  const response = await getApiFootballClient().get<ApiFootballTeamStatisticsResponse>(
    "/teams/statistics",
    { team: teamId, league: leagueId, season },
  );
  await upsertTeamStats(response.response);
  return response.response;
}
