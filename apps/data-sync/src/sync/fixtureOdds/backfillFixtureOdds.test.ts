import { describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({
  getFixtureOddsForFixtures: vi.fn(),
  getFixturesBetweenDates: vi.fn(),
  syncFixtureOdds: vi.fn(),
}));

vi.mock("@black-diamond/database/fixtures", () => ({
  getFixturesBetweenDates: mocks.getFixturesBetweenDates,
}));
vi.mock("@black-diamond/database/fixtureOdds", () => ({
  getFixtureOddsForFixtures: mocks.getFixtureOddsForFixtures,
}));
vi.mock("./syncFixtureOdds.js", () => ({ syncFixtureOdds: mocks.syncFixtureOdds }));

import { backfillFixtureOdds } from "./backfillFixtureOdds.js";

function fixture(id: number, timestamp: number, status: string, leagueId = 39): Fixture {
  return {
    fixture: { id, timestamp, status: { short: status } },
    league: { id: leagueId },
  } as Fixture;
}

describe("backfillFixtureOdds", () => {
  it("only requests missing odds for selected-league fixtures completed in the provider history window", async () => {
    const now = new Date("2026-10-25T12:00:00.000Z");
    mocks.getFixturesBetweenDates.mockResolvedValue([
      fixture(1, now.getTime() / 1000 - 60, "FT"),
      fixture(2, now.getTime() / 1000 - 60, "FT"),
      fixture(3, now.getTime() / 1000 - 60, "NS"),
      fixture(4, now.getTime() / 1000 - 60, "FT", 999),
      fixture(5, now.getTime() / 1000 + 60, "FT"),
    ]);
    mocks.getFixtureOddsForFixtures.mockResolvedValue([{ fixtureId: 2 }]);

    await expect(backfillFixtureOdds(now)).resolves.toBe(1);

    expect(mocks.getFixturesBetweenDates).toHaveBeenCalledWith("2026-10-18", "2026-10-26");
    expect(mocks.getFixtureOddsForFixtures).toHaveBeenCalledWith([1, 2]);
    expect(mocks.syncFixtureOdds).toHaveBeenCalledWith(1);
  });
});
