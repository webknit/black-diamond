import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  getLeagueById: vi.fn(),
  upsertFixtures: vi.fn(),
}));

vi.mock("@black-diamond/database/leagues", () => ({ getLeagueById: mocks.getLeagueById }));
vi.mock("@black-diamond/database/fixtures", () => ({ upsertFixtures: mocks.upsertFixtures }));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { syncFullCurrentSeasonFixtures } from "./syncFullCurrentSeasonFixtures.js";

describe("syncFullCurrentSeasonFixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLeagueById.mockResolvedValue({
      seasons: [{ year: 2026, current: true }],
    });
  });

  it("requests the full current season and bulk-upserts the response", async () => {
    const fixtures = [{ fixture: { id: 10 } }];
    mocks.get.mockResolvedValue({ response: fixtures });

    await expect(syncFullCurrentSeasonFixtures(39)).resolves.toEqual({
      leagueId: 39,
      season: 2026,
      fixturesSynced: 1,
    });

    expect(mocks.get).toHaveBeenCalledWith("/fixtures", {
      league: 39,
      season: 2026,
    });
    expect(mocks.upsertFixtures).toHaveBeenCalledWith(fixtures);
  });
});
