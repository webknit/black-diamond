import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  aggregate: vi.fn(),
  collection: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { searchFixtures } from "./searchFixtures.js";

describe("searchFixtures", () => {
  it("ranks live and recently finished fixtures before upcoming matches", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ aggregate: mocks.aggregate });
    mocks.aggregate.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);

    await searchFixtures("juve");

    expect(mocks.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $addFields: expect.objectContaining({
            searchStatusOrder: expect.objectContaining({
              $switch: expect.objectContaining({
                branches: expect.arrayContaining([
                  expect.objectContaining({
                    case: {
                      $and: [
                        { $in: ["$fixture.status.short", ["FT", "AET", "PEN"]] },
                        expect.objectContaining({ $gte: ["$fixture.timestamp", expect.any(Number)] }),
                      ],
                    },
                    then: 1,
                  }),
                ]),
              }),
            }),
          }),
        }),
        expect.objectContaining({
          $sort: { searchStatusOrder: 1, searchTimestampOrder: 1 },
        }),
        { $limit: 8 },
      ]),
    );
  });
});
