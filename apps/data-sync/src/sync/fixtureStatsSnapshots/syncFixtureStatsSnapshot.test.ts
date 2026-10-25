import { describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({
  getFixturesBefore: vi.fn(),
  upsertFixtureStatsSnapshot: vi.fn(),
}));

vi.mock("@black-diamond/database/fixtures", () => ({
  getFixturesBefore: mocks.getFixturesBefore,
}));
vi.mock("@black-diamond/database/fixtureStatsSnapshots", () => ({
  upsertFixtureStatsSnapshot: mocks.upsertFixtureStatsSnapshot,
}));

import { syncFixtureStatsSnapshot } from "./syncFixtureStatsSnapshot.js";

function fixture(id: number, timestamp: number, homeId: number, awayId: number, homeGoals: number, awayGoals: number): Fixture {
  return {
    fixture: { id, date: new Date(timestamp * 1000).toISOString(), timestamp, status: { short: "FT" } },
    league: { id: 39, season: 2026 },
    teams: {
      home: { id: homeId, name: `Team ${homeId}`, logo: null },
      away: { id: awayId, name: `Team ${awayId}`, logo: null },
    },
    goals: { home: homeGoals, away: awayGoals },
  } as unknown as Fixture;
}

describe("syncFixtureStatsSnapshot", () => {
  it("calculates pre-match form, table position, and results from earlier completed fixtures", async () => {
    const target = fixture(100, 10_000, 1, 2, null as never, null as never);
    target.fixture.status.short = "NS";
    mocks.getFixturesBefore.mockResolvedValue([
      fixture(1, 1_000, 1, 3, 2, 0),
      fixture(2, 2_000, 2, 1, 1, 1),
      fixture(3, 3_000, 2, 3, 3, 0),
    ]);

    await syncFixtureStatsSnapshot(target);

    expect(mocks.getFixturesBefore).toHaveBeenCalledWith(39, 2026, 10_000);
    expect(mocks.upsertFixtureStatsSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        fixtureId: 100,
        fixtureDateAtSnapshot: target.fixture.date,
        home: expect.objectContaining({
          leaguePosition: 2,
          leaguePoints: 4,
          leagueTeams: 3,
          form: "WD",
          formHome: "W",
          formAway: "D",
          cleanSheets: { home: 1, away: 0, total: 1 },
          failedToScore: { home: 0, away: 0, total: 0 },
          summary: expect.objectContaining({ wins: { count: 1, percentage: 50 } }),
          last5: expect.objectContaining({
            played: 2,
            over2_5: { count: 0, percentage: 0 },
            under3_5: { count: 2, percentage: 100 },
          }),
        }),
        away: expect.objectContaining({ leaguePosition: 1, form: "DW" }),
      }),
    );
  });
});
