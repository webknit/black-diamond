import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixturesByIds } from "./getFixturesByIds.js";

describe("getFixturesByIds", () => {
  it("uses one indexed fixture-ID query", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getFixturesByIds([10, 20]);

    expect(mocks.find).toHaveBeenCalledWith({ "fixture.id": { $in: [10, 20] } });
  });

  it("does not query Mongo without fixture IDs", async () => {
    await expect(getFixturesByIds([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
