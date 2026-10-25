import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  sort: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFixturesForStatsSnapshotBackfill } from "./getFixturesForStatsSnapshotBackfill.js";

describe("getFixturesForStatsSnapshotBackfill", () => {
  it("does not connect when no leagues are selected", async () => {
    await expect(getFixturesForStatsSnapshotBackfill([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });

  it("reads every selected-league fixture that can have a pre-match snapshot", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);

    await getFixturesForStatsSnapshotBackfill([39, 140]);

    expect(mocks.find).toHaveBeenCalledWith({
      "league.id": { $in: [39, 140] },
      "fixture.status.short": {
        $in: ["NS", "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE", "FT", "AET", "PEN"],
      },
    });
    expect(mocks.sort).toHaveBeenCalledWith({ "fixture.timestamp": 1 });
  });
});
