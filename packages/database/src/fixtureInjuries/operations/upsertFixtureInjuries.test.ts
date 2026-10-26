import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertFixtureInjuries } from "./upsertFixtureInjuries.js";

describe("upsertFixtureInjuries", () => {
  it("uses the fixture ID as the single injuries-document identity", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    const injuries = {
      fixtureId: 10,
      injuries: [],
      syncedAt: "2026-10-26T16:00:00.000Z",
    };

    await upsertFixtureInjuries(injuries);

    expect(mocks.collection).toHaveBeenCalledWith("fixtureInjuries");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { fixtureId: 10 },
      { $set: injuries },
      { upsert: true },
    );
  });
});
