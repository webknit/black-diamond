import type { Fixture } from "@black-diamond/core/fixture";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bulkWrite: vi.fn(),
  collection: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertFixtures } from "./upsertFixtures.js";

describe("upsertFixtures", () => {
  it("does not connect to MongoDB when there are no fixtures", async () => {
    await upsertFixtures([]);

    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });

  it("bulk upserts fixtures by their API-Football fixture ID", async () => {
    const fixture = { fixture: { id: 123 } } as Fixture;
    const database = { collection: mocks.collection };

    mocks.getDatabase.mockResolvedValue(database);
    mocks.collection.mockReturnValue({ bulkWrite: mocks.bulkWrite });

    await upsertFixtures([fixture]);

    expect(mocks.collection).toHaveBeenCalledWith("fixtures");
    expect(mocks.bulkWrite).toHaveBeenCalledWith([
      {
        updateOne: {
          filter: { "fixture.id": 123 },
          update: { $set: fixture },
          upsert: true,
        },
      },
    ]);
  });
});
