import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getLeaguesByIds } from "./getLeaguesByIds.js";

describe("getLeaguesByIds", () => {
  it("gets stored league records in one query", async () => {
    const leagues = [{ league: { id: 39, type: "League" } }];
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue(leagues);

    await expect(getLeaguesByIds([39, 40])).resolves.toBe(leagues);
    expect(mocks.collection).toHaveBeenCalledWith("leagues");
    expect(mocks.find).toHaveBeenCalledWith({ "league.id": { $in: [39, 40] } });
  });

  it("skips the database query for an empty list", async () => {
    await expect(getLeaguesByIds([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
