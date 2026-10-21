import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ syncLeagueStatsForLeague: vi.fn() }));

vi.mock("../../config/selectedLeagues.js", () => ({
  selectedLeagues: [{ id: 39 }, { id: 140 }],
}));
vi.mock("./syncLeagueStatsForLeague.js", () => ({
  syncLeagueStatsForLeague: mocks.syncLeagueStatsForLeague,
}));

import { syncLeagueStats } from "./syncLeagueStats.js";

describe("syncLeagueStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("syncs stats for every configured league", async () => {
    await syncLeagueStats();

    expect(mocks.syncLeagueStatsForLeague).toHaveBeenCalledWith(39);
    expect(mocks.syncLeagueStatsForLeague).toHaveBeenCalledWith(140);
  });
});
