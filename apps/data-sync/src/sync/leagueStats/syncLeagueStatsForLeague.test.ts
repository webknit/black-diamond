import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  calculateLeagueStats: vi.fn(),
  getLeagueById: vi.fn(),
  upsertLeagueStats: vi.fn(),
}));

vi.mock("@black-diamond/database/leagueStats", () => ({
  calculateLeagueStats: mocks.calculateLeagueStats,
  upsertLeagueStats: mocks.upsertLeagueStats,
}));
vi.mock("@black-diamond/database/leagues", () => ({
  getLeagueById: mocks.getLeagueById,
}));

import { syncLeagueStatsForLeague } from "./syncLeagueStatsForLeague.js";

describe("syncLeagueStatsForLeague", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calculates and stores stats for the current season", async () => {
    const stats = { league: { id: 39, season: 2026 } };
    mocks.getLeagueById.mockResolvedValue({
      league: { id: 39, name: "Premier League" },
      country: { name: "England" },
      seasons: [{ year: 2026, current: true }],
    });
    mocks.calculateLeagueStats.mockResolvedValue(stats);

    await expect(syncLeagueStatsForLeague(39)).resolves.toBe(stats);
    expect(mocks.calculateLeagueStats).toHaveBeenCalledWith({
      id: 39,
      name: "Premier League",
      country: "England",
      season: 2026,
    });
    expect(mocks.upsertLeagueStats).toHaveBeenCalledWith(stats);
  });
});
