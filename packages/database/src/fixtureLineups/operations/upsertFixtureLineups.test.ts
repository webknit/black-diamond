import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertFixtureLineups } from "./upsertFixtureLineups.js";

describe("upsertFixtureLineups", () => {
  it("uses the fixture ID as the single lineups-document identity", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    const lineups = { fixtureId: 10, lineups: [], syncedAt: "2026-10-26T16:00:00.000Z" };

    await upsertFixtureLineups(lineups);

    expect(mocks.collection).toHaveBeenCalledWith("fixtureLineups");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { fixtureId: 10 },
      { $set: lineups },
      { upsert: true },
    );
  });
});
