import { getLeagueTeams } from "@black-diamond/database/teams";
import { getLeagueById } from "@black-diamond/database/leagues";
import { syncTeamStats } from "./syncTeamStats.js";

export async function syncTeamStatsForLeague(leagueId: number) {
  const league = await getLeagueById(leagueId);
  const season = league?.seasons.find((item) => item.current);
  if (!league || !season) throw new Error(`Cannot sync team stats: league ID ${leagueId} has no current season`);
  for (const team of await getLeagueTeams(leagueId, season.year)) {
    await syncTeamStats(team.teamId, leagueId, season.year);
  }
}
