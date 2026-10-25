import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertFixtureEvents } from "./upsertFixtureEvents.js";

describe("upsertFixtureEvents", () => {
  it("uses the fixture ID as the single event-document identity", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    const fixtureEvents = { fixtureId: 10, events: [], syncedAt: "2026-10-25T12:00:00.000Z" };

    await upsertFixtureEvents(fixtureEvents);

    expect(mocks.collection).toHaveBeenCalledWith("fixtureEvents");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { fixtureId: 10 },
      { $set: fixtureEvents },
      { upsert: true },
    );
  });
});
