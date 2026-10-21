import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), findOne: vi.fn(), getDatabase: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixtureStatsSnapshot } from "./getFixtureStatsSnapshot.js";

describe("getFixtureStatsSnapshot", () => {
  it("only finds a snapshot for the fixture's current scheduled date", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    await getFixtureStatsSnapshot({ fixture: { id: 123, date: "2026-10-28T19:45:00.000Z" } } as never);
    expect(mocks.findOne).toHaveBeenCalledWith({ fixtureId: 123, fixtureDateAtSnapshot: "2026-10-28T19:45:00.000Z" });
  });
});
