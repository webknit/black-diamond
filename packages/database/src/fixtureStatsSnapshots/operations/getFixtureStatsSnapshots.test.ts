import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixtureStatsSnapshots } from "./getFixtureStatsSnapshots.js";

describe("getFixtureStatsSnapshots", () => {
  it("reads snapshots for a group of fixture IDs", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getFixtureStatsSnapshots([10, 20]);

    expect(mocks.find).toHaveBeenCalledWith({ fixtureId: { $in: [10, 20] } });
  });

  it("does not connect when there are no fixture IDs", async () => {
    await expect(getFixtureStatsSnapshots([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
