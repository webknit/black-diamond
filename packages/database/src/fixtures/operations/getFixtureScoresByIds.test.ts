import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFixtureScoresByIds } from "./getFixtureScoresByIds.js";

describe("getFixtureScoresByIds", () => {
  it("returns scores for the requested fixtures", async () => {
    const toArray = vi.fn().mockResolvedValue([{ fixtureId: 123, home: 2, away: 1 }]);
    const map = vi.fn().mockReturnValue({ toArray });
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ map });

    await expect(getFixtureScoresByIds([123])).resolves.toEqual([{ fixtureId: 123, home: 2, away: 1 }]);
    expect(mocks.find).toHaveBeenCalledWith(
      { "fixture.id": { $in: [123] } },
      {
        projection: {
          _id: 0,
          "fixture.id": 1,
          "goals.home": 1,
          "goals.away": 1,
        },
      },
    );
  });

  it("does not query the database when no fixture ids are supplied", async () => {
    await expect(getFixtureScoresByIds([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
