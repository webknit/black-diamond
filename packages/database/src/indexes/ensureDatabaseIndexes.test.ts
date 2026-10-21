import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  createIndex: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { ensureDatabaseIndexes } from "./ensureDatabaseIndexes.js";

describe("ensureDatabaseIndexes", () => {
  it("creates the database identity indexes", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ createIndex: mocks.createIndex });

    await ensureDatabaseIndexes();

    expect(mocks.collection).toHaveBeenNthCalledWith(1, "leagues");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      1,
      { "league.id": 1 },
      { name: "unique_league_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(2, "teams");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      2,
      { "team.id": 1 },
      { name: "unique_team_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(3, "leagueTeams");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      3,
      { leagueId: 1, season: 1, teamId: 1 },
      { name: "unique_league_season_team", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(4, "fixtures");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      4,
      { "fixture.id": 1 },
      { name: "unique_fixture_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(5, "fixtures");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      5,
      { "league.id": 1, "league.season": 1, "fixture.status.short": 1 },
      { name: "league_season_status" },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(6, "leagueStandings");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      6,
      { "league.id": 1, "league.season": 1 },
      { name: "unique_league_season", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(7, "leagueStats");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      7,
      { "league.id": 1, "league.season": 1 },
      { name: "unique_league_season", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(8, "fullSeasonFixtureSyncStates");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      8,
      { leagueId: 1, season: 1 },
      { name: "unique_league_season", unique: true },
    );
  });
});
