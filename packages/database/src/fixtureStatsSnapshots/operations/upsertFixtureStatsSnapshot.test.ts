import { describe, expect, it, vi } from "vitest";
import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { upsertFixtureStatsSnapshot } from "./upsertFixtureStatsSnapshot.js";

describe("upsertFixtureStatsSnapshot", () => {
  it("upserts by the API-Football fixture id", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    const snapshot = { fixtureId: 10 } as FixtureStatsSnapshot;
    await upsertFixtureStatsSnapshot(snapshot);
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { fixtureId: 10 },
      { $set: snapshot },
      { upsert: true },
    );
  });
});
