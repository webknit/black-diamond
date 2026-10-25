import { beforeEach, describe, expect, it, vi } from "vitest";

	const mocks = vi.hoisted(() => ({
	  syncFixturesInProgress: vi.fn(),
	  syncFixtureEvents: vi.fn(),
	  syncBetResults: vi.fn(),
}));

vi.mock("../sync/fixtures/syncFixturesInProgress.js", () => ({
  syncFixturesInProgress: mocks.syncFixturesInProgress,
}));
vi.mock("../sync/fixtureEvents/syncFixtureEvents.js", () => ({
  syncFixtureEvents: mocks.syncFixtureEvents,
}));
vi.mock("../sync/bets/syncBetResults.js", () => ({ syncBetResults: mocks.syncBetResults }));

import { runLiveSync } from "./liveSync.js";

describe("live sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes fixtures that are in progress", async () => {
		mocks.syncFixturesInProgress.mockResolvedValue([{ fixture: { id: 10 } }]);
    await runLiveSync();

    expect(mocks.syncFixturesInProgress).toHaveBeenCalledOnce();
		expect(mocks.syncFixtureEvents).toHaveBeenCalledWith([10]);
    expect(mocks.syncBetResults).toHaveBeenCalledOnce();
  });
});
