import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDatabase: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertLeagueStats } from "./upsertLeagueStats.js";

describe("upsertLeagueStats", () => {
  it("upserts a league season's calculated statistics", async () => {
    const stats = { league: { id: 39, season: 2026 } } as never;
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });

    await upsertLeagueStats(stats);

    expect(mocks.collection).toHaveBeenCalledWith("leagueStats");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { "league.id": 39, "league.season": 2026 },
      { $set: stats },
      { upsert: true },
    );
  });
});
