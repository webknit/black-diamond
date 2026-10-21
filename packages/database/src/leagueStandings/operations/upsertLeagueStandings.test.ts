import type { LeagueStandings } from "@black-diamond/core/leagueStandings";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDatabase: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertLeagueStandings } from "./upsertLeagueStandings.js";

describe("upsertLeagueStandings", () => {
  it("upserts the current table by league and season", async () => {
    const standings = {
      league: { id: 39, season: 2026 },
    } as LeagueStandings;

    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });

    await upsertLeagueStandings(standings);

    expect(mocks.collection).toHaveBeenCalledWith("leagueStandings");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { "league.id": 39, "league.season": 2026 },
      { $set: standings },
      { upsert: true },
    );
  });
});
