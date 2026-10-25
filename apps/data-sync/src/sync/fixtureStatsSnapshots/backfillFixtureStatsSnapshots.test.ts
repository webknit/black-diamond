import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getFixturesWithoutStatsSnapshots: vi.fn(),
  syncFixtureStatsSnapshot: vi.fn(),
}));

vi.mock("@black-diamond/database/fixtures", () => ({
  getFixturesWithoutStatsSnapshots: mocks.getFixturesWithoutStatsSnapshots,
}));
vi.mock("./syncFixtureStatsSnapshot.js", () => ({
  syncFixtureStatsSnapshot: mocks.syncFixtureStatsSnapshot,
}));

import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { backfillFixtureStatsSnapshots } from "./backfillFixtureStatsSnapshots.js";

describe("backfillFixtureStatsSnapshots", () => {
  it("calculates missing snapshots in chronological order for selected leagues", async () => {
    const fixtures = [
      { fixture: { id: 1, timestamp: 1_000 } },
      { fixture: { id: 2, timestamp: 2_000 } },
    ];
    mocks.getFixturesWithoutStatsSnapshots.mockResolvedValue(fixtures);

    await expect(backfillFixtureStatsSnapshots()).resolves.toBe(2);

    expect(mocks.getFixturesWithoutStatsSnapshots).toHaveBeenCalledWith(
      selectedLeagues.map((league) => league.id),
    );
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenNthCalledWith(1, fixtures[0]);
    expect(mocks.syncFixtureStatsSnapshot).toHaveBeenNthCalledWith(2, fixtures[1]);
  });
});
