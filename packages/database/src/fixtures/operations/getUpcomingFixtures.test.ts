import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getUpcomingFixtures } from "./getUpcomingFixtures.js";

describe("getUpcomingFixtures", () => {
  it("uses the timestamp and not-started status query", async () => {
    const now = new Date("2026-10-21T12:00:00.000Z");
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getUpcomingFixtures(now, 7);

    expect(mocks.find).toHaveBeenCalledWith({
      "fixture.timestamp": { $gt: 1792584000, $lte: 1793188800 },
      "fixture.status.short": "NS",
    });
  });
});
