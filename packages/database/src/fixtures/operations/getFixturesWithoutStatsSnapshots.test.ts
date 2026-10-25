import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  aggregate: vi.fn(),
  collection: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFixturesWithoutStatsSnapshots } from "./getFixturesWithoutStatsSnapshots.js";

describe("getFixturesWithoutStatsSnapshots", () => {
  it("does not connect when no leagues are selected", async () => {
    await expect(getFixturesWithoutStatsSnapshots([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });

  it("finds selected-league in-progress or completed fixtures with no snapshot", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ aggregate: mocks.aggregate });
    mocks.aggregate.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([{ fixture: { id: 1 } }]);

    await expect(getFixturesWithoutStatsSnapshots([39, 140])).resolves.toEqual([
      { fixture: { id: 1 } },
    ]);

    expect(mocks.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          "league.id": { $in: [39, 140] },
          "fixture.status.short": {
            $in: [
              "1H",
              "HT",
              "2H",
              "ET",
              "BT",
              "P",
              "SUSP",
              "INT",
              "LIVE",
              "FT",
              "AET",
              "PEN",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "fixtureStatsSnapshots",
          localField: "fixture.id",
          foreignField: "fixtureId",
          as: "matchingSnapshots",
        },
      },
      { $match: { matchingSnapshots: { $eq: [] } } },
      { $sort: { "fixture.timestamp": 1 } },
      { $project: { matchingSnapshots: 0 } },
    ]);
  });
});
