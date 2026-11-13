import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  backfillFixtureOdds: vi.fn(),
  logSyncStep: vi.fn(),
  runFixtureStatsSnapshotBackfill: vi.fn(),
  syncStrategyPerformances: vi.fn(),
  syncBotdFixtures: vi.fn(),
}));

vi.mock("../sync/fixtureOdds/backfillFixtureOdds", () => ({
  backfillFixtureOdds: mocks.backfillFixtureOdds,
}));
vi.mock("../utils/logging/logSyncStep", () => ({ logSyncStep: mocks.logSyncStep }));
vi.mock("./backfillFixtureStatsSnapshots", () => ({
  runFixtureStatsSnapshotBackfill: mocks.runFixtureStatsSnapshotBackfill,
}));
vi.mock("../sync/strategyPerformances/syncStrategyPerformances", () => ({
  syncStrategyPerformances: mocks.syncStrategyPerformances,
}));
vi.mock("../sync/botdFixtures/syncBotdFixtures", () => ({ syncBotdFixtures: mocks.syncBotdFixtures }));

import { runBackfill } from "./backfill";

describe("backfill run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rebuilds snapshots and odds before backfilling strategy performances", async () => {
    await runBackfill();

    expect(mocks.runFixtureStatsSnapshotBackfill).toHaveBeenCalledBefore(mocks.logSyncStep);
    expect(mocks.logSyncStep).toHaveBeenCalledWith(
      "backfill recent missing pre-match odds",
      mocks.backfillFixtureOdds,
    );
    expect(mocks.logSyncStep).toHaveBeenCalledWith(
      "backfill strategy performances",
      mocks.syncStrategyPerformances,
    );
    expect(mocks.logSyncStep).toHaveBeenCalledWith("sync BotD fixtures", mocks.syncBotdFixtures);
  });
});
