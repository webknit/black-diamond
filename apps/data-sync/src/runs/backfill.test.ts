import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  backfillFixtureOdds: vi.fn(),
  logSyncStep: vi.fn(),
  runFixtureStatsSnapshotBackfill: vi.fn(),
}));

vi.mock("../sync/fixtureOdds/backfillFixtureOdds.js", () => ({
  backfillFixtureOdds: mocks.backfillFixtureOdds,
}));
vi.mock("../utils/logging/logSyncStep.js", () => ({ logSyncStep: mocks.logSyncStep }));
vi.mock("./backfillFixtureStatsSnapshots.js", () => ({
  runFixtureStatsSnapshotBackfill: mocks.runFixtureStatsSnapshotBackfill,
}));

import { runBackfill } from "./backfill.js";

describe("backfill run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rebuilds season snapshots before filling recent missing pre-match odds", async () => {
    await runBackfill();

    expect(mocks.runFixtureStatsSnapshotBackfill).toHaveBeenCalledBefore(mocks.logSyncStep);
    expect(mocks.logSyncStep).toHaveBeenCalledWith(
      "backfill recent missing pre-match odds",
      mocks.backfillFixtureOdds,
    );
  });
});
