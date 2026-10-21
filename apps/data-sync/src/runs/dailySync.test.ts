import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fixtures: vi.fn(),
  syncLeagueStats: vi.fn(),
  syncTeamStatsForTodaysFixtures: vi.fn(),
  syncUpcomingPredictions: vi.fn(),
  leagues: vi.fn(),
  standings: vi.fn(),
  teams: vi.fn(),
}));

vi.mock("../sync/fixtures/syncFixtures.js", () => ({ syncFixtures: mocks.fixtures }));
vi.mock("../sync/leagues/syncSelectedLeagues.js", () => ({
  syncSelectedLeagues: mocks.leagues,
}));
vi.mock("../sync/leagueStats/syncLeagueStats.js", () => ({
  syncLeagueStats: mocks.syncLeagueStats,
}));
vi.mock("../sync/teamStats/syncTeamStatsForTodaysFixtures.js", () => ({
  syncTeamStatsForTodaysFixtures: mocks.syncTeamStatsForTodaysFixtures,
}));
vi.mock("../sync/predictions/syncUpcomingPredictions.js", () => ({
  syncUpcomingPredictions: mocks.syncUpcomingPredictions,
}));
vi.mock("../sync/standings/syncStandings.js", () => ({
  syncStandings: mocks.standings,
}));
vi.mock("../sync/teams/syncTeams.js", () => ({ syncTeams: mocks.teams }));

import { runDailySync } from "./dailySync.js";

describe("daily sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs leagues, teams, fixtures, stats, then standings", async () => {
    await runDailySync();

    expect(mocks.leagues).toHaveBeenCalledBefore(mocks.teams);
    expect(mocks.teams).toHaveBeenCalledBefore(mocks.fixtures);
    expect(mocks.fixtures).toHaveBeenCalledBefore(mocks.syncLeagueStats);
    expect(mocks.syncLeagueStats).toHaveBeenCalledBefore(mocks.standings);
    expect(mocks.syncUpcomingPredictions).toHaveBeenCalledOnce();
  });
});
