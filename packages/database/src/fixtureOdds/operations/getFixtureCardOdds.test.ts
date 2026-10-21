import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixtureCardOdds } from "./getFixtureCardOdds.js";

describe("getFixtureCardOdds", () => {
  it("selects only odds fields needed for fixture cards", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getFixtureCardOdds([10, 20]);

    expect(mocks.find).toHaveBeenCalledWith(
      { fixtureId: { $in: [10, 20] } },
      {
        projection: {
          _id: 0,
          fixtureId: 1,
          "odds.name": 1,
          "odds.values.value": 1,
          "odds.values.odd": 1,
        },
      },
    );
  });

  it("does not connect when there are no fixture IDs", async () => {
    await expect(getFixtureCardOdds([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
