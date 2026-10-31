import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  limit: vi.fn(),
  sort: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getTeamFixtureResearch } from "./getTeamFixtureResearch.js";

describe("getTeamFixtureResearch", () => {
  it("gets the five latest completed fixtures and five upcoming fixtures for one league season", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);

    await getTeamFixtureResearch(33, 39, 2026, new Date("2026-10-30T12:00:00Z"));

    expect(mocks.find).toHaveBeenNthCalledWith(
      1,
      {
        "league.id": 39,
        "league.season": 2026,
        $or: [{ "teams.home.id": 33 }, { "teams.away.id": 33 }],
        "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
      },
      { projection: { _id: 0 } },
    );
    expect(mocks.find).toHaveBeenNthCalledWith(
      2,
      {
        "league.id": 39,
        "league.season": 2026,
        $or: [{ "teams.home.id": 33 }, { "teams.away.id": 33 }],
        "fixture.status.short": "NS",
        "fixture.timestamp": { $gte: 1793361600 },
      },
      { projection: { _id: 0 } },
    );
    expect(mocks.sort).toHaveBeenNthCalledWith(1, { "fixture.timestamp": -1 });
    expect(mocks.sort).toHaveBeenNthCalledWith(2, { "fixture.timestamp": 1 });
    expect(mocks.limit).toHaveBeenCalledTimes(2);
    expect(mocks.limit).toHaveBeenCalledWith(5);
  });
});
