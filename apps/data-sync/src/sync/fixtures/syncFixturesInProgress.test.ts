import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  getFixturesAwaitingResult: vi.fn(),
  upsertFixtures: vi.fn<(fixtures: unknown[]) => void>(),
}));

vi.mock("@black-diamond/database/fixtures", () => ({
  getFixturesAwaitingResult: mocks.getFixturesAwaitingResult,
  upsertFixtures: mocks.upsertFixtures,
}));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import {
  didFixtureScoreIncrease,
  formatMatchMinute,
  syncFixturesInProgress,
} from "./syncFixturesInProgress.js";

describe("syncFixturesInProgress", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes persisted in-progress fixtures so a newly finished match is stored", async () => {
    const fixturesAwaitingResult = [{ fixture: { id: 10 } }];
    const completedFixture = {
      fixture: { id: 10, status: { short: "FT" } },
    };
    mocks.get.mockResolvedValueOnce({ response: [completedFixture] });
    mocks.getFixturesAwaitingResult.mockResolvedValue(fixturesAwaitingResult);

    await expect(syncFixturesInProgress()).resolves.toEqual([completedFixture]);

    expect(mocks.get).toHaveBeenCalledWith("/fixtures", { ids: "10" });
    expect(mocks.upsertFixtures.mock.calls).toContainEqual([[completedFixture]]);
  });

  it("does not make an ID refresh request when no fixture is in progress", async () => {
    mocks.getFixturesAwaitingResult.mockResolvedValue([]);

    await expect(syncFixturesInProgress()).resolves.toEqual([]);

    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("does not mistake an initial null-to-zero score for a goal", () => {
    expect(
      didFixtureScoreIncrease(
        { home: null, away: null },
        { home: 0, away: 0 },
      ),
    ).toBe(false);
    expect(
      didFixtureScoreIncrease(
        { home: 0, away: 0 },
        { home: 1, away: 0 },
      ),
    ).toBe(true);
  });

  it("formats the elapsed match minute for a score update", () => {
    expect(formatMatchMinute({ elapsed: 63 })).toBe("63′");
    expect(formatMatchMinute({ elapsed: null })).toBeNull();
  });
});
