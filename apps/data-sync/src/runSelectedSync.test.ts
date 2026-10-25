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

import { getSyncRun, runSelectedSync } from "./runSelectedSync.js";

describe("selected sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs only the requested sync", async () => {
    await runSelectedSync("daily");

    expect(mocks.ensureDatabaseIndexes).not.toHaveBeenCalled();
    expect(mocks.runDailySync).toHaveBeenCalledOnce();
    expect(mocks.runHourlySync).not.toHaveBeenCalled();
    expect(mocks.runLiveSync).not.toHaveBeenCalled();
    expect(mocks.runThreeHourlySync).not.toHaveBeenCalled();
    expect(mocks.runWeeklySync).not.toHaveBeenCalled();
  });

  it("maps each Railway command name to its sync run", () => {
    expect(getSyncRun("indexes").label).toBe("ensure database indexes");
    expect(getSyncRun("hourly").label).toBe("hourly sync");
    expect(getSyncRun("live").label).toBe("live sync");
    expect(getSyncRun("three-hourly").label).toBe("three-hourly sync");
    expect(getSyncRun("weekly").label).toBe("weekly sync");
  });

  it("runs database index setup only when explicitly requested", async () => {
    await runSelectedSync("indexes");

    expect(mocks.ensureDatabaseIndexes).toHaveBeenCalledOnce();
    expect(mocks.runDailySync).not.toHaveBeenCalled();
  });

  it("rejects an unknown or missing sync run", () => {
    expect(() => getSyncRun()).toThrow("Choose a sync run");
    expect(() => getSyncRun("monthly")).toThrow("Choose a sync run");
  });
});
