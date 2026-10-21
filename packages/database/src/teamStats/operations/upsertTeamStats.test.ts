import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { upsertTeamStats } from "./upsertTeamStats.js";

describe("upsertTeamStats", () => {
  it("upserts one team's league season statistics", async () => {
    const stats = { team: { id: 33 }, league: { id: 39, season: 2026 } } as never;
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    await upsertTeamStats(stats);
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { "team.id": 33, "league.id": 39, "league.season": 2026 },
      { $set: stats },
      { upsert: true },
    );
  });
});
