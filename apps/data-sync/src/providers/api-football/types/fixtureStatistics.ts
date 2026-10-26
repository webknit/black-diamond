export type ApiFootballFixtureStatisticsResponse = {
  response: Array<{
    team: { id: number };
    statistics: Array<{ type: string; value: number | string | null }>;
  }>;
};
