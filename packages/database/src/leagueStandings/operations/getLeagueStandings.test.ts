import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  findOne: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getLeagueStandings } from "./getLeagueStandings.js";

describe("getLeagueStandings", () => {
  it("finds the table for one league season", async () => {
    const standings = { league: { id: 39, season: 2026 } };

    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue(standings);

    await expect(getLeagueStandings(39, 2026)).resolves.toBe(standings);
    expect(mocks.collection).toHaveBeenCalledWith("leagueStandings");
    expect(mocks.findOne).toHaveBeenCalledWith({
      "league.id": 39,
      "league.season": 2026,
    });
  });
});
