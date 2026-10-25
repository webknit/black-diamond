import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getFixtureSeasonsForLeague: vi.fn(),
  getLeagueById: vi.fn(),
  syncLeagueStatsForLeague: vi.fn(),
}));

vi.mock("@black-diamond/core/selectedLeagues", () => ({
  selectedLeagues: [{ id: 39 }],
}));
vi.mock("@black-diamond/database/fixtures", () => ({
  getFixtureSeasonsForLeague: mocks.getFixtureSeasonsForLeague,
}));
vi.mock("@black-diamond/database/leagues", () => ({
  getLeagueById: mocks.getLeagueById,
}));
vi.mock("./syncLeagueStatsForLeague.js", () => ({
  syncLeagueStatsForLeague: mocks.syncLeagueStatsForLeague,
}));

import { backfillLeagueStats } from "./backfillLeagueStats.js";

describe("backfillLeagueStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rebuilds only seasons with locally stored fixtures", async () => {
    mocks.getLeagueById.mockResolvedValue({ league: { id: 39 } });
    mocks.getFixtureSeasonsForLeague.mockResolvedValue([2025, 2026]);

    await backfillLeagueStats();

    expect(mocks.syncLeagueStatsForLeague).toHaveBeenNthCalledWith(1, 39, 2025);
    expect(mocks.syncLeagueStatsForLeague).toHaveBeenNthCalledWith(2, 39, 2026);
  });
});
