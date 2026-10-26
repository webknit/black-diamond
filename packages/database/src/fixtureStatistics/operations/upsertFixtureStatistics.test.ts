import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertFixtureStatistics } from "./upsertFixtureStatistics.js";

describe("upsertFixtureStatistics", () => {
  it("uses the fixture ID as the single statistics-document identity", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    const statistics = {
      fixtureId: 10,
      home: { teamId: 1, shots: 12, shotsOnTarget: 5, possession: 53 },
      away: { teamId: 2, shots: 7, shotsOnTarget: 3, possession: 47 },
      syncedAt: "2026-10-26T16:00:00.000Z",
    };

    await upsertFixtureStatistics(statistics);

    expect(mocks.collection).toHaveBeenCalledWith("fixtureStatistics");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { fixtureId: 10 },
      { $set: statistics },
      { upsert: true },
    );
  });
});
