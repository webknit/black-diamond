import {
  isFullSeasonFixtureSyncCompleted,
  setFullSeasonFixtureSyncCompleted,
} from "@black-diamond/database/fullSeasonFixtureSyncStates";
import { getLeagueById } from "@black-diamond/database/leagues";
import {
  syncLeagueFixtures,
  type FixtureDateRange,
} from "./syncLeagueFixtures.js";
import { syncFullCurrentSeasonFixtures } from "./syncFullCurrentSeasonFixtures.js";
import { getUtcDateString } from "../../utils/time/getUtcDateString.js";

export async function syncCurrentSeasonFixtures(
  leagueId: number,
  dateRange?: FixtureDateRange,
) {
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

  const fullSeasonFixtureSyncCompleted = await isFullSeasonFixtureSyncCompleted(
    leagueId,
    currentSeason.year,
  );

  if (!fullSeasonFixtureSyncCompleted) {
    const result = await syncFullCurrentSeasonFixtures(leagueId);

    await setFullSeasonFixtureSyncCompleted(leagueId, currentSeason.year);

    return { ...result, syncType: "full-season" as const };
  }

  const result = await syncLeagueFixtures(
    leagueId,
    dateRange ?? getDailyFixtureDateRange(),
  );

  return { ...result, syncType: "daily-window" as const };
}

export function getFixtureRecoveryDateRange(
  lastCompletedAt: Date | undefined,
  now = new Date(),
): FixtureDateRange {
  if (!lastCompletedAt) return getDailyFixtureDateRange(now);

  return {
    from: getUtcDateString(lastCompletedAt, -1),
    to: getUtcDateString(now, 14),
  };
}

export function getDailyFixtureDateRange(now = new Date()): FixtureDateRange {
  return {
    from: getUtcDateString(now, -1),
    to: getUtcDateString(now, 14),
  };
}
