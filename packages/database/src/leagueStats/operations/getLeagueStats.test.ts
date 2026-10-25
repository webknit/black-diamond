import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  aggregate: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getLeagueStats } from "./getLeagueStats.js";

describe("getLeagueStats", () => {
  it("gets stats for the selected leagues without MongoDB ids", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ aggregate: mocks.aggregate });
    mocks.aggregate.mockReturnValue({ toArray: mocks.toArray });

    await getLeagueStats([39, 40]);

    expect(mocks.collection).toHaveBeenCalledWith("leagueStats");
    expect(mocks.aggregate).toHaveBeenCalledWith([
      { $match: { "league.id": { $in: [39, 40] }, round: { $exists: true } } },
      { $sort: { "league.season": -1, roundLastFixtureTimestamp: -1 } },
      { $group: { _id: "$league.id", stats: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$stats" } },
      { $project: { _id: 0 } },
    ]);
  });

  it("does not query the database with no selected leagues", async () => {
    await expect(getLeagueStats([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
