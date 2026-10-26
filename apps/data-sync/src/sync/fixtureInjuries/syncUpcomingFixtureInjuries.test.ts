import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  getFixturesBetweenDates: vi.fn(),
  upsertFixtureInjuries: vi.fn(),
}));

vi.mock("@black-diamond/database/fixtures", () => ({
  getFixturesBetweenDates: mocks.getFixturesBetweenDates,
}));
vi.mock("@black-diamond/database/fixtureInjuries", () => ({
  upsertFixtureInjuries: mocks.upsertFixtureInjuries,
}));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { syncUpcomingFixtureInjuries } from "./syncUpcomingFixtureInjuries.js";

function fixture(id: number, timestamp: number, status: string): Fixture {
  return {
    fixture: { id, timestamp, status: { short: status } },
  } as Fixture;
}

describe("syncUpcomingFixtureInjuries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("syncs the next seven days of upcoming fixtures in groups of up to twenty", async () => {
    const now = new Date("2026-10-26T12:00:00.000Z");
    mocks.getFixturesBetweenDates.mockResolvedValue([
      fixture(1, now.getTime() / 1000 + 60, "NS"),
      fixture(2, now.getTime() / 1000 + 120, "NS"),
      fixture(3, now.getTime() / 1000 - 60, "NS"),
      fixture(4, now.getTime() / 1000 + 60, "1H"),
    ]);
    mocks.get.mockResolvedValue({
      response: [{
        fixture: { id: 1 },
        player: { id: 10, name: "A. Player", photo: null, type: "Missing Fixture", reason: "Injured" },
        team: { id: 100, name: "Home", logo: null },
      }, {
        fixture: { id: 1 },
        player: { id: 10, name: "A. Player", photo: null, type: "Missing Fixture", reason: "Injured" },
        team: { id: 100, name: "Home", logo: null },
      }],
    });

    await expect(syncUpcomingFixtureInjuries(now)).resolves.toBe(2);

    expect(mocks.getFixturesBetweenDates).toHaveBeenCalledWith("2026-10-26", "2026-11-03");
    expect(mocks.get).toHaveBeenCalledWith("/injuries", { ids: "1-2" });
    expect(mocks.upsertFixtureInjuries).toHaveBeenCalledWith(expect.objectContaining({
      fixtureId: 1,
      injuries: [{
        player: { id: 10, name: "A. Player", photo: null, type: "Missing Fixture", reason: "Injured" },
        team: { id: 100, name: "Home", logo: null },
      }],
    }));
    expect(mocks.upsertFixtureInjuries).toHaveBeenCalledWith(expect.objectContaining({
      fixtureId: 2,
      injuries: [],
    }));
  });
});
