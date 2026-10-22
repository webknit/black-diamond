import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getLeagueStats } from "./getLeagueStats.js";

describe("getLeagueStats", () => {
  it("gets stats for the selected leagues without MongoDB ids", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getLeagueStats([39, 40]);

    expect(mocks.collection).toHaveBeenCalledWith("leagueStats");
    expect(mocks.find).toHaveBeenCalledWith(
      { "league.id": { $in: [39, 40] } },
      { projection: { _id: 0 } },
    );
  });

  it("does not query the database with no selected leagues", async () => {
    await expect(getLeagueStats([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
