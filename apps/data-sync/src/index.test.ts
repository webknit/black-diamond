import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureDatabaseIndexes: vi.fn(),
  runDailySync: vi.fn(),
  runHourlySync: vi.fn(),
  runLiveSync: vi.fn(),
  runThreeHourlySync: vi.fn(),
  runWeeklySync: vi.fn(),
}));

vi.mock("@black-diamond/database/indexes", () => ({
  ensureDatabaseIndexes: mocks.ensureDatabaseIndexes,
}));
vi.mock("./runs/dailySync.js", () => ({ runDailySync: mocks.runDailySync }));
vi.mock("./runs/hourlySync.js", () => ({ runHourlySync: mocks.runHourlySync }));
vi.mock("./runs/liveSync.js", () => ({ runLiveSync: mocks.runLiveSync }));
vi.mock("./runs/threeHourlySync.js", () => ({
  runThreeHourlySync: mocks.runThreeHourlySync,
}));
vi.mock("./runs/weeklySync.js", () => ({ runWeeklySync: mocks.runWeeklySync }));

describe("data-sync entry point", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("runs each sync group after database setup", async () => {
    await import("./index.js");

    expect(mocks.ensureDatabaseIndexes).toHaveBeenCalledBefore(
      mocks.runDailySync,
    );
    expect(mocks.runDailySync).toHaveBeenCalledBefore(mocks.runHourlySync);
    expect(mocks.runHourlySync).toHaveBeenCalledBefore(mocks.runLiveSync);
    expect(mocks.runLiveSync).toHaveBeenCalledBefore(mocks.runThreeHourlySync);
    expect(mocks.runThreeHourlySync).toHaveBeenCalledBefore(mocks.runWeeklySync);
  });
});
