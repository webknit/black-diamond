import type { Fixture } from "@black-diamond/core/fixture";
import { upsertFixtureStatistics } from "@black-diamond/database/fixtureStatistics";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixtureStatisticsResponse } from "../../providers/api-football/types/fixtureStatistics.js";

function getStatistic(
  statistics: Array<{ type: string; value: number | string | null }> | undefined,
  type: string,
): number | null {
  const value = statistics?.find((statistic) => statistic.type === type)?.value;
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;

  const numericValue = Number(value.replace("%", "").trim());
  return Number.isFinite(numericValue) ? numericValue : null;
}

export async function syncFixtureStatistics(fixtures: Fixture[]): Promise<number> {
  const apiFootball = getApiFootballClient();

  for (const fixture of fixtures) {
    const response = await apiFootball.get<ApiFootballFixtureStatisticsResponse>(
      "/fixtures/statistics",
      { fixture: fixture.fixture.id },
    );
    const homeStatistics = response.response.find(
      (statistics) => statistics.team.id === fixture.teams.home.id,
    );
    const awayStatistics = response.response.find(
      (statistics) => statistics.team.id === fixture.teams.away.id,
    );

    await upsertFixtureStatistics({
      fixtureId: fixture.fixture.id,
      home: {
        teamId: fixture.teams.home.id,
        shots: getStatistic(homeStatistics?.statistics, "Total Shots"),
        shotsOnTarget: getStatistic(homeStatistics?.statistics, "Shots on Goal"),
        possession: getStatistic(homeStatistics?.statistics, "Ball Possession"),
      },
      away: {
        teamId: fixture.teams.away.id,
        shots: getStatistic(awayStatistics?.statistics, "Total Shots"),
        shotsOnTarget: getStatistic(awayStatistics?.statistics, "Shots on Goal"),
        possession: getStatistic(awayStatistics?.statistics, "Ball Possession"),
      },
      syncedAt: new Date().toISOString(),
    });
  }

  return fixtures.length;
}
