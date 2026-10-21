import { getTeamsWithFixturesOnDate } from "@black-diamond/database/teams";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";
import { syncTeamStats } from "./syncTeamStats.js";

export async function syncTeamStatsForTodaysFixtures(now = new Date()) {
  const teams = await getTeamsWithFixturesOnDate(getUtcDateString(now));
  const uniqueTeams = new Map(teams.map((team) => [`${team.teamId}-${team.leagueId}-${team.season}`, team]));
  for (const team of uniqueTeams.values()) {
    await syncTeamStats(team.teamId, team.leagueId, team.season);
  }
}
