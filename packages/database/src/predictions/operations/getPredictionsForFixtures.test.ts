import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getPredictionsForFixtures } from "./getPredictionsForFixtures.js";

describe("getPredictionsForFixtures", () => {
  it("does not connect when there are no fixture IDs", async () => {
    await expect(getPredictionsForFixtures([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });

  it("finds stored API-Football predictions by fixture ID", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([{ fixtureId: 10, response: {} }]);

    await expect(getPredictionsForFixtures([10, 20])).resolves.toEqual([
      { fixtureId: 10, response: {} },
    ]);
    expect(mocks.find).toHaveBeenCalledWith({ fixtureId: { $in: [10, 20] } });
  });
});
