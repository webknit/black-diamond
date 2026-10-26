import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), upsertFixtureLineups: vi.fn() }));
vi.mock("@black-diamond/database/fixtureLineups", () => ({
  upsertFixtureLineups: mocks.upsertFixtureLineups,
}));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { syncFixtureLineups } from "./syncFixtureLineups.js";

describe("syncFixtureLineups", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores compact starting lineups and formations for each fixture", async () => {
    mocks.get.mockResolvedValue({
      response: [{
        team: { id: 1 },
        formation: "4-3-3",
        coach: { name: "A. Coach" },
		startXI: [{ player: { id: 10, name: "A. Player", number: 9, pos: "F" } }],
      }],
    });

    await expect(syncFixtureLineups([100])).resolves.toBe(1);

    expect(mocks.get).toHaveBeenCalledWith("/fixtures/lineups", { fixture: 100 });
    expect(mocks.upsertFixtureLineups).toHaveBeenCalledWith(expect.objectContaining({
      fixtureId: 100,
      lineups: [{
        teamId: 1,
        formation: "4-3-3",
        coach: { name: "A. Coach" },
        startXI: [{ id: 10, name: "A. Player", number: 9, position: "F" }],
      }],
    }));
  });
});
