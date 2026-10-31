import { error } from "@sveltejs/kit";
import { getTeamFixtureResearch } from "@black-diamond/database/fixtures";
import { getLeagueStandings } from "@black-diamond/database/leagueStandings";
import { getTeamById } from "@black-diamond/database/teams";
import { getTeamStats } from "@black-diamond/database/teamStats";

export async function load({ params, url }: { params: { teamId: string }; url: URL }) {
  const teamId = Number(params.teamId);
  const leagueId = Number(url.searchParams.get("league"));
  const season = Number(url.searchParams.get("season"));

  if (
    !Number.isSafeInteger(teamId) ||
    !Number.isSafeInteger(leagueId) ||
    !Number.isSafeInteger(season)
  ) {
    throw error(404, "Team not found");
  }

  const [team, stats, standings, fixtures] = await Promise.all([
    getTeamById(teamId),
    getTeamStats(teamId, leagueId, season),
    getLeagueStandings(leagueId, season),
    getTeamFixtureResearch(teamId, leagueId, season),
  ]);

  if (!team) throw error(404, "Team not found");

  const standing = standings?.league.standings
    .flat()
    .find((item) => item.team.id === teamId) ?? null;

  return { team, stats, standings, standing, fixtures };
}
