import { beforeEach, describe, expect, it, vi } from "vitest";

	const mocks = vi.hoisted(() => ({
	  syncFixturesInProgress: vi.fn(),
	  syncFixtureEvents: vi.fn(),
	  syncFixtureStatistics: vi.fn(),
	  syncBetResults: vi.fn(),
	  getRecentlyFinishedFixtures: vi.fn(),
	  getFixtureEventsForFixtures: vi.fn(),
}));

vi.mock("../sync/fixtures/syncFixturesInProgress.js", () => ({
  syncFixturesInProgress: mocks.syncFixturesInProgress,
}));
vi.mock("../sync/fixtureEvents/syncFixtureEvents.js", () => ({
  syncFixtureEvents: mocks.syncFixtureEvents,
}));
vi.mock("../sync/fixtureStatistics/syncFixtureStatistics.js", () => ({
  syncFixtureStatistics: mocks.syncFixtureStatistics,
}));
vi.mock("../sync/bets/syncBetResults.js", () => ({ syncBetResults: mocks.syncBetResults }));
vi.mock("@black-diamond/database/fixtures", () => ({ getRecentlyFinishedFixtures: mocks.getRecentlyFinishedFixtures }));
vi.mock("@black-diamond/database/fixtureEvents", () => ({ getFixtureEventsForFixtures: mocks.getFixtureEventsForFixtures }));

import { runLiveSync } from "./liveSync.js";

describe("live sync run", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes fixtures that are in progress", async () => {
		mocks.syncFixturesInProgress.mockResolvedValue([{ fixture: { id: 10 } }]);
		mocks.getRecentlyFinishedFixtures.mockResolvedValue([]);
		mocks.getFixtureEventsForFixtures.mockResolvedValue([]);
    await runLiveSync();

    expect(mocks.syncFixturesInProgress).toHaveBeenCalledOnce();
		expect(mocks.syncFixtureEvents).toHaveBeenCalledWith([10]);
		expect(mocks.syncFixtureStatistics).toHaveBeenCalledWith([{ fixture: { id: 10 } }]);
    expect(mocks.syncBetResults).toHaveBeenCalledOnce();
  });
});
