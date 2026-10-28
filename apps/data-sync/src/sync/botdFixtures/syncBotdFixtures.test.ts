import { describe, expect, it, vi } from "vitest";
import type { Fixture } from "@black-diamond/core/fixture";

const mocks = vi.hoisted(() => ({
  getUpcomingFixtures: vi.fn(),
  getFixtureOddsForFixtures: vi.fn(),
  getFixtureStatsSnapshots: vi.fn(),
  upsertBotdFixtures: vi.fn(),
  deleteBotdFixtures: vi.fn(),
}));
vi.mock("@black-diamond/database/fixtures", () => ({ getUpcomingFixtures: mocks.getUpcomingFixtures }));
vi.mock("@black-diamond/database/fixtureOdds", () => ({ getFixtureOddsForFixtures: mocks.getFixtureOddsForFixtures }));
vi.mock("@black-diamond/database/fixtureStatsSnapshots", () => ({ getFixtureStatsSnapshots: mocks.getFixtureStatsSnapshots }));
vi.mock("@black-diamond/database/botdFixtures", () => ({
  upsertBotdFixtures: mocks.upsertBotdFixtures,
  deleteBotdFixtures: mocks.deleteBotdFixtures,
}));
import { syncBotdFixtures } from "./syncBotdFixtures.js";

function fixture(id: number, timestamp: number, status = "NS") {
  return { fixture: { id, timestamp, status: { short: status } } } as unknown as Fixture;
}

describe("syncBotdFixtures", () => {
  it("stores only not-started fixtures within the seven-day BotD window", async () => {
    const now = new Date("2026-10-21T12:00:00.000Z");
    const included = fixture(1, now.getTime() / 1000 + 60 * 60);
    mocks.getUpcomingFixtures.mockResolvedValue([included]);
    mocks.getFixtureStatsSnapshots.mockResolvedValue([]);
    mocks.getFixtureOddsForFixtures.mockResolvedValue([]);

    await syncBotdFixtures(now);

    expect(mocks.getUpcomingFixtures).toHaveBeenCalledWith(now, 7);
    expect(mocks.getFixtureStatsSnapshots).toHaveBeenCalledWith([1]);
    expect(mocks.getFixtureOddsForFixtures).toHaveBeenCalledWith([1]);
    expect(mocks.upsertBotdFixtures).not.toHaveBeenCalled();
    expect(mocks.deleteBotdFixtures).toHaveBeenCalledWith([1]);
  });
});
