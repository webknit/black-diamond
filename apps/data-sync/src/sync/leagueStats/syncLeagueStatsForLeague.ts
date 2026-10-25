import {
  calculateLeagueStatsSnapshots,
  upsertLeagueStats,
} from "@black-diamond/database/leagueStats";
import { getLeagueById } from "@black-diamond/database/leagues";

export async function syncLeagueStatsForLeague(leagueId: number, seasonYear?: number) {
  const league = await getLeagueById(leagueId);

  if (!league) {
    throw new Error(
      `Cannot sync league stats: league ID ${leagueId} is not in MongoDB`,
    );
  }

  const season = seasonYear === undefined
    ? league.seasons.find((candidate) => candidate.current)
    : league.seasons.find((candidate) => candidate.year === seasonYear);

  if (!season) {
    throw new Error(
      `Cannot sync league stats: league ID ${leagueId} does not include season ${seasonYear ?? "current"}`,
    );
  }

  const snapshots = await calculateLeagueStatsSnapshots({
    id: league.league.id,
    name: league.league.name,
    country: league.country.name,
    season: season.year,
  });

  for (const snapshot of snapshots) {
    await upsertLeagueStats(snapshot);
  }

  return snapshots;
}
