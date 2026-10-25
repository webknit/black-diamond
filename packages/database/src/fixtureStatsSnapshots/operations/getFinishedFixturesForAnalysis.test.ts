import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  aggregate: vi.fn(),
  collection: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFinishedFixturesForAnalysis } from "./getFinishedFixturesForAnalysis.js";

describe("getFinishedFixturesForAnalysis", () => {
  it("does not connect when no leagues are selected", async () => {
    await expect(getFinishedFixturesForAnalysis([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });

  it("reads completed fixtures with their optional pre-match snapshot in chronological order", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ aggregate: mocks.aggregate });
    mocks.aggregate.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);

    await getFinishedFixturesForAnalysis([39, 140]);

    expect(mocks.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          "league.id": { $in: [39, 140] },
          "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
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
      {
        $set: {
          fixtureStatsSnapshot: { $arrayElemAt: ["$matchingSnapshots", 0] },
        },
      },
      { $project: { matchingSnapshots: 0 } },
      { $sort: { "fixture.timestamp": 1 } },
    ]);
  });
});
