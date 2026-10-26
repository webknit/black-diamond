export type FixtureTeamStatistics = {
  teamId: number;
  shots: number | null;
  shotsOnTarget: number | null;
  possession: number | null;
};

export type FixtureStatistics = {
  fixtureId: number;
  home: FixtureTeamStatistics;
  away: FixtureTeamStatistics;
  syncedAt: string;
};
