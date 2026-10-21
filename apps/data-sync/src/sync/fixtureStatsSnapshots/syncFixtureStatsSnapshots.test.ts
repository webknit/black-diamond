import { describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({ getFixturesBetweenDates: vi.fn(), syncFixtureStatsSnapshot: vi.fn() }));
vi.mock("@black-diamond/database/fixtures", () => ({ getFixturesBetweenDates: mocks.getFixturesBetweenDates }));
vi.mock("./syncFixtureStatsSnapshot.js", () => ({ syncFixtureStatsSnapshot: mocks.syncFixtureStatsSnapshot }));
import { syncFixtureStatsSnapshots } from "./syncFixtureStatsSnapshots.js";

function upcoming(id: number, timestamp: number, status = "NS") {
  return { fixture: { id, timestamp, status: { short: status } } } as unknown as Fixture;
}

describe("syncFixtureStatsSnapshots", () => {
  it("only refreshes not-started fixtures in the next seven exact days", async () => {
    const now = new Date("2026-10-21T12:00:00.000Z");
    const nowTimestamp = now.getTime() / 1000;
    const included = upcoming(1, nowTimestamp + 6 * 24 * 60 * 60);
    mocks.getFixturesBetweenDates.mockResolvedValue([
      upcoming(2, nowTimestamp),
      included,
      upcoming(3, nowTimestamp + 7 * 24 * 60 * 60 + 1),
      upcoming(4, nowTimestamp + 60, "PST"),
    ]);

    await syncFixtureStatsSnapshots(now);

    expect(mocks.getFixturesBetweenDates).toHaveBeenCalledWith("2026-10-21", "2026-10-29");
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenCalledTimes(1);
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenCalledWith(included);
  });
});
