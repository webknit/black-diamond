import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDatabase: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("../../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { setFullSeasonFixtureSyncCompleted } from "./setFullSeasonFixtureSyncCompleted.js";

describe("setFullSeasonFixtureSyncCompleted", () => {
  it("upserts the completed state for one league season", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });

    await setFullSeasonFixtureSyncCompleted(39, 2026);

    expect(mocks.collection).toHaveBeenCalledWith("fullSeasonFixtureSyncStates");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { leagueId: 39, season: 2026 },
      {
        $set: {
          leagueId: 39,
          season: 2026,
          completedAt: expect.any(Date),
        },
      },
      { upsert: true },
    );
  });
});
