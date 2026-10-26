import { describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({
  getFixturesBetweenDates: vi.fn(),
  syncFixtureOdds: vi.fn(),
}));

vi.mock("@black-diamond/database/fixtures", () => ({
  getFixturesBetweenDates: mocks.getFixturesBetweenDates,
}));
vi.mock("./syncFixtureOdds.js", () => ({ syncFixtureOdds: mocks.syncFixtureOdds }));

import { syncUpcomingFixtureOdds } from "./syncUpcomingFixtureOdds.js";

function fixture(id: number, timestamp: number, status: string): Fixture {
  return {
    fixture: { id, timestamp, status: { short: status } },
  } as Fixture;
}

describe("syncUpcomingFixtureOdds", () => {
  it("only refreshes odds while the fixture is still upcoming", async () => {
    const now = new Date("2026-10-25T12:00:00.000Z");
    mocks.getFixturesBetweenDates.mockResolvedValue([
      fixture(1, now.getTime() / 1000 + 60, "NS"),
      fixture(2, now.getTime() / 1000 - 60, "NS"),
      fixture(3, now.getTime() / 1000 + 60, "1H"),
    ]);

    await syncUpcomingFixtureOdds(now);

    expect(mocks.syncFixtureOdds).toHaveBeenCalledTimes(1);
    expect(mocks.syncFixtureOdds).toHaveBeenCalledWith(1);
  });

  it("stops the current run when the provider rejects an odds request", async () => {
    const now = new Date("2026-10-25T12:00:00.000Z");
    mocks.getFixturesBetweenDates.mockResolvedValue([
      fixture(1, now.getTime() / 1000 + 60, "NS"),
      fixture(2, now.getTime() / 1000 + 120, "NS"),
    ]);
    mocks.syncFixtureOdds.mockRejectedValueOnce(new Error("Rate limited"));
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await syncUpcomingFixtureOdds(now);

    expect(mocks.syncFixtureOdds).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      "[data-sync] Stopped odds sync after fixture 1 failed. The next scheduled run will retry.",
      expect.any(Error),
    );

    error.mockRestore();
  });
});
