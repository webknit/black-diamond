import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fixtures: vi.fn(),
  syncLeagueStats: vi.fn(),
  syncTeamStatsForTodaysFixtures: vi.fn(),
  syncUpcomingPredictions: vi.fn(),
  syncUpcomingFixtureInjuries: vi.fn(),
  syncFixtureStatsSnapshots: vi.fn(),
  syncBotdFixtures: vi.fn(),
  syncBetResults: vi.fn(),
  syncStrategyPerformances: vi.fn(),
  leagues: vi.fn(),
  standings: vi.fn(),
  teams: vi.fn(),
}));

vi.mock("../sync/fixtures/syncFixtures", () => ({ syncFixtures: mocks.fixtures }));
vi.mock("../sync/leagues/syncSelectedLeagues", () => ({
  syncSelectedLeagues: mocks.leagues,
}));
vi.mock("../sync/leagueStats/syncLeagueStats", () => ({
  syncLeagueStats: mocks.syncLeagueStats,
}));
vi.mock("../sync/teamStats/syncTeamStatsForTodaysFixtures", () => ({
  syncTeamStatsForTodaysFixtures: mocks.syncTeamStatsForTodaysFixtures,
}));
vi.mock("../sync/predictions/syncUpcomingPredictions", () => ({
  syncUpcomingPredictions: mocks.syncUpcomingPredictions,
}));
vi.mock("../sync/fixtureInjuries/syncUpcomingFixtureInjuries", () => ({
  syncUpcomingFixtureInjuries: mocks.syncUpcomingFixtureInjuries,
}));
vi.mock("../sync/fixtureStatsSnapshots/syncFixtureStatsSnapshots", () => ({
  syncFixtureStatsSnapshots: mocks.syncFixtureStatsSnapshots,
}));
vi.mock("../sync/botdFixtures/syncBotdFixtures", () => ({ syncBotdFixtures: mocks.syncBotdFixtures }));
vi.mock("../sync/bets/syncBetResults", () => ({
  syncBetResults: mocks.syncBetResults,
}));
vi.mock("../sync/strategyPerformances/syncStrategyPerformances", () => ({
  syncStrategyPerformances: mocks.syncStrategyPerformances,
}));
vi.mock("../sync/standings/syncStandings", () => ({
  syncStandings: mocks.standings,
}));
vi.mock("../sync/teams/syncTeams", () => ({ syncTeams: mocks.teams }));

import { runDailySync } from "./dailySync";

describe("daily sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs leagues, teams, recovered fixtures, bets, snapshots, BotD, predictions, injuries, stats, standings, then strategy performances", async () => {
    await runDailySync();

    expect(mocks.leagues).toHaveBeenCalledBefore(mocks.teams);
    expect(mocks.teams).toHaveBeenCalledBefore(mocks.fixtures);
    expect(mocks.fixtures).toHaveBeenCalledBefore(mocks.syncBetResults);
    expect(mocks.fixtures).toHaveBeenCalledBefore(mocks.syncFixtureStatsSnapshots);
    expect(mocks.syncFixtureStatsSnapshots).toHaveBeenCalledBefore(mocks.syncBotdFixtures);
    expect(mocks.fixtures).toHaveBeenCalledBefore(mocks.syncLeagueStats);
    expect(mocks.syncLeagueStats).toHaveBeenCalledBefore(mocks.standings);
    expect(mocks.standings).toHaveBeenCalledBefore(mocks.syncStrategyPerformances);
    expect(mocks.syncUpcomingPredictions).toHaveBeenCalledOnce();
    expect(mocks.syncUpcomingFixtureInjuries).toHaveBeenCalledOnce();
  });
});
