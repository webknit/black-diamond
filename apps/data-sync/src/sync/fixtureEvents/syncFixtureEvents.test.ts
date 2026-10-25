import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), upsertFixtureEvents: vi.fn() }));

vi.mock("@black-diamond/database/fixtureEvents", () => ({
  upsertFixtureEvents: mocks.upsertFixtureEvents,
}));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { syncFixtureEvents } from "./syncFixtureEvents.js";

describe("syncFixtureEvents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores the latest API-Football events for every refreshed fixture", async () => {
    const events = [{ type: "Goal", detail: "Normal Goal" }];
    mocks.get.mockResolvedValue({ response: events });

    await expect(syncFixtureEvents([10, 20])).resolves.toBe(2);

    expect(mocks.get).toHaveBeenNthCalledWith(1, "/fixtures/events", { fixture: 10 });
    expect(mocks.get).toHaveBeenNthCalledWith(2, "/fixtures/events", { fixture: 20 });
    expect(mocks.upsertFixtureEvents).toHaveBeenCalledWith(expect.objectContaining({ fixtureId: 10, events }));
    expect(mocks.upsertFixtureEvents).toHaveBeenCalledWith(expect.objectContaining({ fixtureId: 20, events }));
  });
});
