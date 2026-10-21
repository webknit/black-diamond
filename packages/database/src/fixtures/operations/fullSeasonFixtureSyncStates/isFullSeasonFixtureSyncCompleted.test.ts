import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  findOne: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { isFullSeasonFixtureSyncCompleted } from "./isFullSeasonFixtureSyncCompleted.js";

describe("isFullSeasonFixtureSyncCompleted", () => {
  it("returns true when the league season has a completed-sync record", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue({ leagueId: 39, season: 2026 });

    await expect(isFullSeasonFixtureSyncCompleted(39, 2026)).resolves.toBe(true);
    expect(mocks.collection).toHaveBeenCalledWith("fullSeasonFixtureSyncStates");
    expect(mocks.findOne).toHaveBeenCalledWith({ leagueId: 39, season: 2026 });
  });

  it("returns false when no completed-sync record exists", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue(null);

    await expect(isFullSeasonFixtureSyncCompleted(39, 2026)).resolves.toBe(false);
  });
});
