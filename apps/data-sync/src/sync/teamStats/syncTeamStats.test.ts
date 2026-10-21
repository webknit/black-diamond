import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), getApiFootballClient: vi.fn(), upsertTeamStats: vi.fn() }));
vi.mock("@black-diamond/database/teamStats", () => ({ upsertTeamStats: mocks.upsertTeamStats }));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({ getApiFootballClient: mocks.getApiFootballClient }));
import { syncTeamStats } from "./syncTeamStats.js";

describe("syncTeamStats", () => {
  it("requests and stores the full API team-statistics response", async () => {
    const stats = { team: { id: 33 }, league: { id: 39, season: 2026 } };
    mocks.getApiFootballClient.mockReturnValue({ get: mocks.get });
    mocks.get.mockResolvedValue({ response: stats });
    await expect(syncTeamStats(33, 39, 2026)).resolves.toBe(stats);
    expect(mocks.get).toHaveBeenCalledWith("/teams/statistics", { team: 33, league: 39, season: 2026 });
    expect(mocks.upsertTeamStats).toHaveBeenCalledWith(stats);
  });
});
