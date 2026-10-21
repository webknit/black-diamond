import { getLeagueById } from "@black-diamond/database/leagues";
import { upsertLeagueTeam, upsertTeam } from "@black-diamond/database/teams";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballTeamsResponse } from "../../providers/api-football/types/teams.js";

export async function syncLeagueTeams(leagueId: number) {
  const league = await getLeagueById(leagueId);

  if (!league) {
    throw new Error(`Cannot sync teams: league ID ${leagueId} is not in MongoDB`);
  }

  const currentSeason = league.seasons.find((season) => season.current);

  if (!currentSeason) {
    throw new Error(`Cannot sync teams: league ID ${leagueId} has no current season`);
  }

  const apiFootball = getApiFootballClient();
  const response = await apiFootball.get<ApiFootballTeamsResponse>("/teams", {
    league: leagueId,
    season: currentSeason.year,
  });

  for (const team of response.response) {
    await upsertTeam(team);
    await upsertLeagueTeam({
      leagueId,
      season: currentSeason.year,
      teamId: team.team.id,
    });
  }

  return {
    leagueId,
    season: currentSeason.year,
    teamsSynced: response.response.length,
  };
}
