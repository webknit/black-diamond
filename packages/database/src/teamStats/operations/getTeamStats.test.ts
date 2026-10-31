import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), findOne: vi.fn(), getDatabase: vi.fn() }));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getTeamStats } from "./getTeamStats.js";

describe("getTeamStats", () => {
  it("finds statistics for one team, league and season", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue(null);

    await getTeamStats(33, 39, 2026);

    expect(mocks.findOne).toHaveBeenCalledWith(
      {
        "team.id": 33,
        "league.id": 39,
        "league.season": 2026,
      },
      { projection: { _id: 0 } },
    );
  });
});
