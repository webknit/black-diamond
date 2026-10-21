import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  findOne: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getLeagueById } from "./getLeagueById.js";

describe("getLeagueById", () => {
  it("finds a league using its API-Football ID", async () => {
    const league = { league: { id: 39 } };

    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue(league);

    await expect(getLeagueById(39)).resolves.toBe(league);
    expect(mocks.collection).toHaveBeenCalledWith("leagues");
    expect(mocks.findOne).toHaveBeenCalledWith({ "league.id": 39 });
  });
});
