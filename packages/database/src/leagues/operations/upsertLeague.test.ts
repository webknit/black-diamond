import type { League } from "@black-diamond/core/league";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDatabase: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertLeague } from "./upsertLeague.js";

describe("upsertLeague", () => {
  it("upserts a league using its API-Football ID", async () => {
    const league = { league: { id: 39 } } as League;

    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });

    await upsertLeague(league);

    expect(mocks.collection).toHaveBeenCalledWith("leagues");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { "league.id": 39 },
      { $set: league },
      { upsert: true },
    );
  });
});
