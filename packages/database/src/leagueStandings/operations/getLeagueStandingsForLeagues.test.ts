import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getLeagueStandingsForLeagues } from "./getLeagueStandingsForLeagues.js";

describe("getLeagueStandingsForLeagues", () => {
  it("gets standings for the selected leagues without MongoDB ids", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getLeagueStandingsForLeagues([39, 40]);

    expect(mocks.collection).toHaveBeenCalledWith("leagueStandings");
    expect(mocks.find).toHaveBeenCalledWith(
      { "league.id": { $in: [39, 40] } },
      { projection: { _id: 0 } },
    );
  });

  it("does not query the database with no selected leagues", async () => {
    await expect(getLeagueStandingsForLeagues([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
