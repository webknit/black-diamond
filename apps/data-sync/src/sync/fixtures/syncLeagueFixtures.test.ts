import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), getLeagueById: vi.fn(), upsertFixtures: vi.fn() }));

vi.mock("@black-diamond/database/leagues", () => ({ getLeagueById: mocks.getLeagueById }));
vi.mock("@black-diamond/database/fixtures", () => ({ upsertFixtures: mocks.upsertFixtures }));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({ getApiFootballClient: () => ({ get: mocks.get }) }));

import { syncLeagueFixtures } from "./syncLeagueFixtures.js";

describe("syncLeagueFixtures", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getLeagueById.mockResolvedValue({ seasons: [{ year: 2026, current: true }] }); });

  it("requests a fixture date range and bulk-upserts the response", async () => {
    const fixtures = [{ fixture: { id: 10 } }];
    const dateRange = { from: "2026-10-20", to: "2026-11-04" };
    mocks.get.mockResolvedValue({ response: fixtures });

    await expect(syncLeagueFixtures(39, dateRange)).resolves.toEqual({ leagueId: 39, season: 2026, ...dateRange, fixturesSynced: 1 });

    expect(mocks.get).toHaveBeenCalledWith("/fixtures", { league: 39, season: 2026, ...dateRange });
    expect(mocks.upsertFixtures).toHaveBeenCalledWith(fixtures);
  });
});
