import {
  calculateLeagueStats,
  upsertLeagueStats,
} from "@black-diamond/database/leagueStats";
import { getLeagueById } from "@black-diamond/database/leagues";

export async function syncLeagueStatsForLeague(leagueId: number) {
  const league = await getLeagueById(leagueId);

  if (!league) {
    throw new Error(
      `Cannot sync league stats: league ID ${leagueId} is not in MongoDB`,
    );
  }

  const currentSeason = league.seasons.find((season) => season.current);

  if (!currentSeason) {
    throw new Error(
      `Cannot sync league stats: league ID ${leagueId} has no current season`,
    );
  }

  const stats = await calculateLeagueStats({
    id: league.league.id,
    name: league.league.name,
    country: league.country.name,
    season: currentSeason.year,
  });

  await upsertLeagueStats(stats);

  return stats;
}
