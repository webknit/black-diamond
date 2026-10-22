import { upsertTeamStats } from "@black-diamond/database/teamStats";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballTeamStatisticsResponse } from "../../providers/api-football/types/teams.js";
import type { TeamStats } from "@black-diamond/core/teamStats";

function isTeamStats(value: TeamStats | []): value is TeamStats {
  return !Array.isArray(value) && value.team?.id !== undefined && value.league?.id !== undefined;
}

export async function syncTeamStats(teamId: number, leagueId: number, season: number) {
  const response = await getApiFootballClient().get<ApiFootballTeamStatisticsResponse>(
    "/teams/statistics",
    { team: teamId, league: leagueId, season },
  );
  if (!isTeamStats(response.response)) {
    console.warn(
      `[data-sync] No team statistics returned for team ${teamId}, league ${leagueId}, season ${season}`,
    );
    return null;
  }

  await upsertTeamStats(response.response);
  return response.response;
}
