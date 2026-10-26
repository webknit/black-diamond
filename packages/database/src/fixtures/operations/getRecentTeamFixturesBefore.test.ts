import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), limit: vi.fn(), sort: vi.fn(), toArray: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getRecentTeamFixturesBefore } from "./getRecentTeamFixturesBefore.js";

describe("getRecentTeamFixturesBefore", () => {
  it("finds the five earlier completed home fixtures for a team", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);

    await getRecentTeamFixturesBefore(39, 2026, 10, 12345, "home");

    expect(mocks.find).toHaveBeenCalledWith({
      "league.id": 39,
      "league.season": 2026,
      "fixture.timestamp": { $lt: 12345 },
      "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
      "teams.home.id": 10,
    });
    expect(mocks.sort).toHaveBeenCalledWith({ "fixture.timestamp": -1 });
    expect(mocks.limit).toHaveBeenCalledWith(5);
  });

  it("matches either venue for overall form", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);

    await getRecentTeamFixturesBefore(39, 2026, 10, 12345, "overall");

    expect(mocks.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [{ "teams.home.id": 10 }, { "teams.away.id": 10 }],
    }));
  });
});
