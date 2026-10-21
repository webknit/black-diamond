import type { LeagueTeam } from "@black-diamond/core/team";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDatabase: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertLeagueTeam } from "./upsertLeagueTeam.js";

describe("upsertLeagueTeam", () => {
  it("upserts a league-team membership using its compound identity", async () => {
    const leagueTeam: LeagueTeam = { leagueId: 39, season: 2026, teamId: 33 };

    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });

    await upsertLeagueTeam(leagueTeam);

    expect(mocks.collection).toHaveBeenCalledWith("leagueTeams");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      leagueTeam,
      { $set: leagueTeam },
      { upsert: true },
    );
  });
});
