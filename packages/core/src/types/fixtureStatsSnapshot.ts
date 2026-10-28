export type FixtureStatsCount = { count: number; percentage: number };
export type FixtureStatsRecord = { played: number; wins: number; draws: number; loses: number; goalsFor: number; goalsAgainst: number };
export type FixtureStatsGoalSummary = {
  wins: FixtureStatsCount;
  draws: FixtureStatsCount;
  btts: FixtureStatsCount;
  over0_5: FixtureStatsCount;
  over1_5: FixtureStatsCount;
  over2_5: FixtureStatsCount;
  over3_5: FixtureStatsCount;
  under0_5: FixtureStatsCount;
  under1_5: FixtureStatsCount;
  under2_5: FixtureStatsCount;
  under3_5: FixtureStatsCount;
};
export type FixtureStatsSnapshotTeam = {
  team: { id: number; name: string; logo: string | null };
  leaguePosition: number | null;
  leaguePoints: number;
  leagueTeams: number;
  form: string;
  formHome: string;
  formAway: string;
  fixtures: { home: FixtureStatsRecord; away: FixtureStatsRecord; total: FixtureStatsRecord };
  // For a home team this is its last five home matches; for an away team, its
  // last five away matches. It keeps recent-form strategy filters venue-specific.
  last5Venue: FixtureStatsRecord & { summary: FixtureStatsGoalSummary };
  cleanSheets: { home: number; away: number; total: number };
  failedToScore: { home: number; away: number; total: number };
  summary: FixtureStatsGoalSummary;
  last5: FixtureStatsGoalSummary & { played: number };
};
export type FixtureStatsSnapshot = {
  fixtureId: number;
  fixtureDateAtSnapshot: string;
  snapshotCapturedAt: string;
  home: FixtureStatsSnapshotTeam;
  away: FixtureStatsSnapshotTeam;
};
