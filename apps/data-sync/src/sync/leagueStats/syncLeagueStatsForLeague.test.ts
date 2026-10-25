import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  calculateLeagueStatsSnapshots: vi.fn(),
  getLeagueById: vi.fn(),
  upsertLeagueStats: vi.fn(),
}));

vi.mock("@black-diamond/database/leagueStats", () => ({
  calculateLeagueStatsSnapshots: mocks.calculateLeagueStatsSnapshots,
  upsertLeagueStats: mocks.upsertLeagueStats,
}));
vi.mock("@black-diamond/database/leagues", () => ({
  getLeagueById: mocks.getLeagueById,
}));

import { syncLeagueStatsForLeague } from "./syncLeagueStatsForLeague.js";

describe("syncLeagueStatsForLeague", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calculates and stores round snapshots for the current season", async () => {
    const snapshots = [{ league: { id: 39, season: 2026 }, round: "Regular Season - 10" }];
    mocks.getLeagueById.mockResolvedValue({
      league: { id: 39, name: "Premier League" },
      country: { name: "England" },
      seasons: [{ year: 2026, current: true }],
    });
    mocks.calculateLeagueStatsSnapshots.mockResolvedValue(snapshots);

    await expect(syncLeagueStatsForLeague(39)).resolves.toBe(snapshots);
    expect(mocks.calculateLeagueStatsSnapshots).toHaveBeenCalledWith({
      id: 39,
      name: "Premier League",
      country: "England",
      season: 2026,
    });
    expect(mocks.upsertLeagueStats).toHaveBeenCalledWith(snapshots[0]);
  });
});
