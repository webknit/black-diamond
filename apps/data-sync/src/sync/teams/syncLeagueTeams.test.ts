import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(), getLeagueById: vi.fn(), upsertTeam: vi.fn(), upsertLeagueTeam: vi.fn(),
}));

vi.mock("@black-diamond/database/leagues", () => ({ getLeagueById: mocks.getLeagueById }));
vi.mock("@black-diamond/database/teams", () => ({ upsertTeam: mocks.upsertTeam, upsertLeagueTeam: mocks.upsertLeagueTeam }));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({ getApiFootballClient: () => ({ get: mocks.get }) }));

import { syncLeagueTeams } from "./syncLeagueTeams.js";

describe("syncLeagueTeams", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getLeagueById.mockResolvedValue({ seasons: [{ year: 2026, current: true }] }); });

  it("upserts every team and its league-season membership", async () => {
    mocks.get.mockResolvedValue({ response: [{ team: { id: 1 } }, { team: { id: 2 } }] });

    await expect(syncLeagueTeams(39)).resolves.toEqual({ leagueId: 39, season: 2026, teamsSynced: 2 });

    expect(mocks.get).toHaveBeenCalledWith("/teams", { league: 39, season: 2026 });
    expect(mocks.upsertTeam).toHaveBeenCalledTimes(2);
    expect(mocks.upsertLeagueTeam).toHaveBeenCalledWith({ leagueId: 39, season: 2026, teamId: 2 });
  });
});
