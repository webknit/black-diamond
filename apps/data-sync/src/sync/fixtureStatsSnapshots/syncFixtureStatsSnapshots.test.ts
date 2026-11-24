import { describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({ getFixturesBefore: vi.fn(), getFixturesBetweenDates: vi.fn(), syncFixtureStatsSnapshot: vi.fn() }));
vi.mock("@black-diamond/database/fixtures", () => ({
  getFixturesBefore: mocks.getFixturesBefore,
  getFixturesBetweenDates: mocks.getFixturesBetweenDates,
}));
vi.mock("./syncFixtureStatsSnapshot", () => ({ syncFixtureStatsSnapshot: mocks.syncFixtureStatsSnapshot }));
import { syncFixtureStatsSnapshots } from "./syncFixtureStatsSnapshots";

function upcoming(id: number, timestamp: number, status = "NS", leagueId = 39) {
  return { fixture: { id, timestamp, status: { short: status } }, league: { id: leagueId, season: 2026 } } as unknown as Fixture;
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
    mocks.getFixturesBefore.mockResolvedValue([]);

    await syncFixtureStatsSnapshots(now);

    expect(mocks.getFixturesBetweenDates).toHaveBeenCalledWith("2026-10-21", "2026-10-29");
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenCalledTimes(1);
    expect(mocks.getFixturesBefore).toHaveBeenCalledWith(39, 2026, included.fixture.timestamp);
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenCalledWith(included, []);
  });

  it("shares one history query between upcoming fixtures in the same league season", async () => {
    const now = new Date("2026-10-21T12:00:00.000Z");
    const nowTimestamp = now.getTime() / 1000;
    const first = upcoming(1, nowTimestamp + 60);
    const second = upcoming(2, nowTimestamp + 120);
    const priorFixtures = [upcoming(3, nowTimestamp - 60, "FT")];
    mocks.getFixturesBetweenDates.mockResolvedValue([first, second]);
    mocks.getFixturesBefore.mockResolvedValue(priorFixtures);

    await syncFixtureStatsSnapshots(now);

    expect(mocks.getFixturesBefore).toHaveBeenCalledTimes(1);
    expect(mocks.getFixturesBefore).toHaveBeenCalledWith(39, 2026, second.fixture.timestamp);
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenNthCalledWith(1, first, priorFixtures);
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenNthCalledWith(2, second, priorFixtures);
  });
});
