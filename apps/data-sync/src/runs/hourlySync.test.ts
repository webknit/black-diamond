import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  syncFixturesInProgress: vi.fn(),
  syncLeagueStandings: vi.fn(),
  syncPrediction: vi.fn(),
}));

vi.mock("../sync/fixtures/syncFixturesInProgress.js", () => ({
  syncFixturesInProgress: mocks.syncFixturesInProgress,
}));
vi.mock("../sync/standings/syncLeagueStandings.js", () => ({
  syncLeagueStandings: mocks.syncLeagueStandings,
}));
vi.mock("../sync/predictions/syncPrediction.js", () => ({ syncPrediction: mocks.syncPrediction }));

import { runHourlySync } from "./hourlySync.js";

describe("hourly sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes standings once for each league with fixtures in progress", async () => {
    mocks.syncFixturesInProgress.mockResolvedValue([
      { fixture: { id: 1 }, league: { id: 39 } },
      { fixture: { id: 2 }, league: { id: 39 } },
      { fixture: { id: 3 }, league: { id: 140 } },
    ]);

    await runHourlySync();

    expect(mocks.syncLeagueStandings).toHaveBeenCalledTimes(2);
    expect(mocks.syncLeagueStandings).toHaveBeenCalledWith(39);
    expect(mocks.syncLeagueStandings).toHaveBeenCalledWith(140);
    expect(mocks.syncPrediction).toHaveBeenCalledWith(1);
    expect(mocks.syncPrediction).toHaveBeenCalledWith(2);
    expect(mocks.syncPrediction).toHaveBeenCalledWith(3);
  });

  it("does not refresh standings when no fixtures are in progress", async () => {
    mocks.syncFixturesInProgress.mockResolvedValue([]);

    await runHourlySync();

    expect(mocks.syncLeagueStandings).not.toHaveBeenCalled();
  });
});
