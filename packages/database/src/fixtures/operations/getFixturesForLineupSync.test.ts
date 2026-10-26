import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFixturesForLineupSync } from "./getFixturesForLineupSync.js";

describe("getFixturesForLineupSync", () => {
  it("finds fixtures shortly before kickoff or still in play", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);

    await getFixturesForLineupSync(new Date("2026-10-25T12:00:00Z"));

    expect(mocks.find).toHaveBeenCalledWith({
      "fixture.timestamp": { $gte: 1792915200, $lte: 1792935000 },
      "fixture.status.short": {
        $nin: ["FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO"],
      },
    });
  });
});
