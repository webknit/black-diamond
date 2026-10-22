import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  syncFixturesInProgress: vi.fn(),
  syncBetResults: vi.fn(),
}));

vi.mock("../sync/fixtures/syncFixturesInProgress.js", () => ({
  syncFixturesInProgress: mocks.syncFixturesInProgress,
}));
vi.mock("../sync/bets/syncBetResults.js", () => ({ syncBetResults: mocks.syncBetResults }));

import { runLiveSync } from "./liveSync.js";

describe("live sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes fixtures that are in progress", async () => {
    await runLiveSync();

    expect(mocks.syncFixturesInProgress).toHaveBeenCalledOnce();
    expect(mocks.syncBetResults).toHaveBeenCalledOnce();
  });
});
