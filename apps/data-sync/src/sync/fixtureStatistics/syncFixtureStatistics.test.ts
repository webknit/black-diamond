import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), upsertFixtureStatistics: vi.fn() }));

vi.mock("@black-diamond/database/fixtureStatistics", () => ({
  upsertFixtureStatistics: mocks.upsertFixtureStatistics,
}));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { syncFixtureStatistics } from "./syncFixtureStatistics.js";

describe("syncFixtureStatistics", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores shots, shots on target, and possession against the home and away teams", async () => {
    mocks.get.mockResolvedValue({
      response: [
        { team: { id: 1 }, statistics: [
          { type: "Total Shots", value: 12 },
          { type: "Shots on Goal", value: 5 },
          { type: "Ball Possession", value: "53%" },
          { type: "Corner Kicks", value: 7 },
        ] },
        { team: { id: 2 }, statistics: [
          { type: "Total Shots", value: 7 },
          { type: "Shots on Goal", value: 3 },
          { type: "Ball Possession", value: "47%" },
        ] },
      ],
    });

    await expect(syncFixtureStatistics([{
      fixture: { id: 10 }, teams: { home: { id: 1 }, away: { id: 2 } },
    }] as never)).resolves.toBe(1);

    expect(mocks.get).toHaveBeenCalledWith("/fixtures/statistics", { fixture: 10 });
    expect(mocks.upsertFixtureStatistics).toHaveBeenCalledWith(expect.objectContaining({
      fixtureId: 10,
      home: { teamId: 1, shots: 12, shotsOnTarget: 5, possession: 53 },
      away: { teamId: 2, shots: 7, shotsOnTarget: 3, possession: 47 },
    }));
  });
});
