import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getLeagueById: vi.fn(),
  isFullSeasonFixtureSyncCompleted: vi.fn(),
  setFullSeasonFixtureSyncCompleted: vi.fn(),
  syncFullCurrentSeasonFixtures: vi.fn(),
  syncLeagueFixtures: vi.fn(),
}));

vi.mock("@black-diamond/database/leagues", () => ({
  getLeagueById: mocks.getLeagueById,
}));
vi.mock("@black-diamond/database/fullSeasonFixtureSyncStates", () => ({
  isFullSeasonFixtureSyncCompleted: mocks.isFullSeasonFixtureSyncCompleted,
  setFullSeasonFixtureSyncCompleted: mocks.setFullSeasonFixtureSyncCompleted,
}));
vi.mock("./syncLeagueFixtures.js", () => ({
  syncLeagueFixtures: mocks.syncLeagueFixtures,
}));
vi.mock("./syncFullCurrentSeasonFixtures.js", () => ({
  syncFullCurrentSeasonFixtures: mocks.syncFullCurrentSeasonFixtures,
}));

import {
  getDailyFixtureDateRange,
  syncCurrentSeasonFixtures,
} from "./syncCurrentSeasonFixtures.js";

const league = { seasons: [{ year: 2026, current: true }] };

describe("syncCurrentSeasonFixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
    mocks.getLeagueById.mockResolvedValue(league);
    mocks.syncLeagueFixtures.mockResolvedValue({ fixturesSynced: 380 });
    mocks.syncFullCurrentSeasonFixtures.mockResolvedValue({ fixturesSynced: 380 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does a full sync once and records completion", async () => {
    mocks.isFullSeasonFixtureSyncCompleted.mockResolvedValue(false);

    await expect(
      syncCurrentSeasonFixtures(39),
    ).resolves.toEqual({ fixturesSynced: 380, syncType: "full-season" });

    expect(mocks.syncFullCurrentSeasonFixtures).toHaveBeenCalledWith(39);
    expect(mocks.setFullSeasonFixtureSyncCompleted).toHaveBeenCalledWith(39, 2026);
  });

  it("uses the daily date range after the full sync exists", async () => {
    mocks.isFullSeasonFixtureSyncCompleted.mockResolvedValue(true);
    await syncCurrentSeasonFixtures(39);

    expect(mocks.syncLeagueFixtures).toHaveBeenCalledWith(39, {
      from: "2026-10-20",
      to: "2026-11-04",
    });
    expect(mocks.setFullSeasonFixtureSyncCompleted).not.toHaveBeenCalled();
  });

  it("rejects a missing league or current season", async () => {
    mocks.getLeagueById.mockResolvedValueOnce(null);
    await expect(syncCurrentSeasonFixtures(39)).rejects.toThrow(
      "league ID 39 is not in MongoDB",
    );

    mocks.getLeagueById.mockResolvedValueOnce({ seasons: [] });
    await expect(syncCurrentSeasonFixtures(39)).rejects.toThrow(
      "has no current season",
    );
  });

  it("builds the daily UTC fixture window", () => {
    expect(getDailyFixtureDateRange(new Date("2026-10-21T12:00:00Z"))).toEqual({
      from: "2026-10-20",
      to: "2026-11-04",
    });
  });
});
