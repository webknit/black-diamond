import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureDatabaseIndexes: vi.fn(),
  runDailySync: vi.fn(),
  runThreeHourlySync: vi.fn(),
  runWeeklySync: vi.fn(),
}));

vi.mock("@black-diamond/database/indexes", () => ({
  ensureDatabaseIndexes: mocks.ensureDatabaseIndexes,
}));
vi.mock("./dailySync.js", () => ({ runDailySync: mocks.runDailySync }));
vi.mock("./threeHourlySync.js", () => ({
  runThreeHourlySync: mocks.runThreeHourlySync,
}));
vi.mock("./weeklySync.js", () => ({ runWeeklySync: mocks.runWeeklySync }));

import { runFullSync } from "./fullSync.js";

describe("full sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs one-off setup, daily data, season team stats, and odds", async () => {
    await runFullSync();

    expect(mocks.ensureDatabaseIndexes).toHaveBeenCalledBefore(mocks.runDailySync);
    expect(mocks.runDailySync).toHaveBeenCalledBefore(mocks.runWeeklySync);
    expect(mocks.runWeeklySync).toHaveBeenCalledBefore(mocks.runThreeHourlySync);
  });
});
