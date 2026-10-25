import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFixturesAwaitingResult } from "./getFixturesAwaitingResult.js";

describe("getFixturesAwaitingResult", () => {
  it("finds recently started fixtures that are not terminal", async () => {
    const now = new Date("2026-10-25T12:00:00Z");
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([{ fixture: { id: 1 } }]);

    await expect(getFixturesAwaitingResult(now)).resolves.toEqual([
      { fixture: { id: 1 } },
    ]);
    expect(mocks.find).toHaveBeenCalledWith({
      "fixture.timestamp": { $gte: 1792756800, $lte: 1792929600 },
      "fixture.status.short": {
        $nin: ["FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO"],
      },
    });
  });
});
