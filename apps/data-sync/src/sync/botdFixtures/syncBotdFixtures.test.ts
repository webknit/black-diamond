import { describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({
  getUpcomingFixtures: vi.fn(),
  getFixtureOddsForFixtures: vi.fn(),
  getFixtureStatsSnapshots: vi.fn(),
  getLeaguesByIds: vi.fn(),
  getLeagueStats: vi.fn(),
  getTopStrategyIds: vi.fn(),
  upsertBotdDays: vi.fn(),
}));
vi.mock("@black-diamond/database/fixtures", () => ({ getUpcomingFixtures: mocks.getUpcomingFixtures }));
vi.mock("@black-diamond/database/fixtureOdds", () => ({ getFixtureOddsForFixtures: mocks.getFixtureOddsForFixtures }));
vi.mock("@black-diamond/database/fixtureStatsSnapshots", () => ({ getFixtureStatsSnapshots: mocks.getFixtureStatsSnapshots }));
vi.mock("@black-diamond/database/leagues", () => ({ getLeaguesByIds: mocks.getLeaguesByIds }));
vi.mock("@black-diamond/database/leagueStats", () => ({ getLeagueStats: mocks.getLeagueStats }));
vi.mock("@black-diamond/database/strategyPerformances", () => ({ getTopStrategyIds: mocks.getTopStrategyIds }));
vi.mock("@black-diamond/database/botdDays", () => ({ upsertBotdDays: mocks.upsertBotdDays }));
import { syncBotdFixtures } from "./syncBotdFixtures.js";

function fixture(id: number, timestamp: number, status = "NS") {
  return { fixture: { id, timestamp, status: { short: status } }, league: { id: 39 } } as unknown as Fixture;
}

describe("syncBotdFixtures", () => {
  it("stores only not-started fixtures within the seven-day BotD window", async () => {
    const now = new Date("2026-10-21T12:00:00.000Z");
    const included = fixture(1, now.getTime() / 1000 + 60 * 60);
    mocks.getUpcomingFixtures.mockResolvedValue([included]);
    mocks.getFixtureStatsSnapshots.mockResolvedValue([]);
    mocks.getFixtureOddsForFixtures.mockResolvedValue([]);
    mocks.getLeaguesByIds.mockResolvedValue([]);
    mocks.getLeagueStats.mockResolvedValue([]);
    mocks.getTopStrategyIds.mockResolvedValue([]);

    await syncBotdFixtures(now);

    expect(mocks.getUpcomingFixtures).toHaveBeenCalledWith(now, 7);
    expect(mocks.getFixtureStatsSnapshots).toHaveBeenCalledWith([1]);
    expect(mocks.getFixtureOddsForFixtures).toHaveBeenCalledWith([1]);
    expect(mocks.getTopStrategyIds).toHaveBeenCalledWith(expect.any(Array), 3);
    expect(mocks.upsertBotdDays).toHaveBeenCalledWith([{ fixtureDate: "2026-10-21", fixtures: [], updatedAt: now.toISOString() }]);
  });

  it("stores a top strategy match with that strategy's reference odds", async () => {
    const now = new Date("2026-10-21T12:00:00.000Z");
    const included = fixture(1, now.getTime() / 1000 + 60 * 60);
    mocks.getUpcomingFixtures.mockResolvedValue([included]);
    mocks.getTopStrategyIds.mockResolvedValue(["noTeamFilters"]);
    mocks.getFixtureStatsSnapshots.mockResolvedValue([{
      fixtureId: 1,
      home: { fixtures: { home: { played: 1, goalsFor: 1, goalsAgainst: 1 } } },
      away: { fixtures: { away: { played: 1, goalsFor: 1, goalsAgainst: 1 } } },
    }]);
    mocks.getFixtureOddsForFixtures.mockResolvedValue([{
      fixtureId: 1,
      odds: [{ name: "Goals Over/Under", values: [{ value: "Over 2.5", odd: "1.80" }] }],
    }]);
    mocks.getLeaguesByIds.mockResolvedValue([]);
    mocks.getLeagueStats.mockResolvedValue([]);

    await syncBotdFixtures(now);

    expect(mocks.upsertBotdDays).toHaveBeenCalledWith([{
      fixtureDate: "2026-10-21",
      fixtures: [{
        fixtureId: 1,
        matches: [{ strategyId: "noTeamFilters", referenceOdd: 1.8 }],
        hasLeagueTable: true,
      }],
      updatedAt: now.toISOString(),
    }]);
  });
});
