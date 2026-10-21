import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  getLeagueById: vi.fn(),
  upsertLeagueStandings: vi.fn(),
}));

vi.mock("@black-diamond/database/leagues", () => ({
  getLeagueById: mocks.getLeagueById,
}));
vi.mock("@black-diamond/database/leagueStandings", () => ({
  upsertLeagueStandings: mocks.upsertLeagueStandings,
}));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { syncLeagueStandings } from "./syncLeagueStandings.js";

describe("syncLeagueStandings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLeagueById.mockResolvedValue({
      seasons: [{ year: 2026, current: true }],
    });
  });

  it("fetches and stores current-season standings", async () => {
    const standings = { league: { id: 39, season: 2026, standings: [] } };
    mocks.get.mockResolvedValue({ response: [standings] });

    await expect(syncLeagueStandings(39)).resolves.toBe(standings);
    expect(mocks.get).toHaveBeenCalledWith("/standings", {
      league: 39,
      season: 2026,
    });
    expect(mocks.upsertLeagueStandings).toHaveBeenCalledWith(standings);
  });

  it("rejects missing stored leagues, seasons, or API standings", async () => {
    mocks.getLeagueById.mockResolvedValueOnce(null);
    await expect(syncLeagueStandings(39)).rejects.toThrow(
      "league ID 39 is not in MongoDB",
    );

    mocks.getLeagueById.mockResolvedValueOnce({ seasons: [] });
    await expect(syncLeagueStandings(39)).rejects.toThrow("has no current season");

    mocks.get.mockResolvedValueOnce({ response: [] });
    await expect(syncLeagueStandings(39)).rejects.toThrow(
      "API-Football returned no standings",
    );
  });
});
