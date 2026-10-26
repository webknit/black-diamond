import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  createIndex: vi.fn(),
  dropIndex: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { ensureDatabaseIndexes } from "./ensureDatabaseIndexes.js";

describe("ensureDatabaseIndexes", () => {
  it("creates the fixture, strategy performance, and round snapshot indexes", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ createIndex: mocks.createIndex, dropIndex: mocks.dropIndex });

    await ensureDatabaseIndexes();

    expect(mocks.createIndex).toHaveBeenCalledWith(
      { "fixture.date": 1 },
      { name: "fixture_date" },
    );
    expect(mocks.createIndex).toHaveBeenCalledWith(
      { "league.id": 1, "fixture.status.short": 1, "fixture.timestamp": 1 },
      { name: "league_status_timestamp" },
    );
    expect(mocks.createIndex).toHaveBeenCalledWith(
      { "league.id": 1, "league.season": 1, "fixture.timestamp": 1 },
      { name: "league_season_timestamp" },
    );
    expect(mocks.createIndex).toHaveBeenCalledWith(
      { accountId: 1, "selections.fixture.id": 1 },
      { name: "account_selection_fixture" },
    );
    expect(mocks.collection).toHaveBeenCalledWith("leagueStats");
    expect(mocks.dropIndex).toHaveBeenCalledWith("unique_league_season");
    expect(mocks.createIndex).toHaveBeenCalledWith(
      { "league.id": 1, "league.season": 1, round: 1 },
      { name: "unique_league_season_round", unique: true },
    );
    expect(mocks.createIndex).toHaveBeenCalledWith(
      { strategyId: 1, strategyVersion: 1, "league.id": 1, season: 1 },
      { name: "unique_strategy_league_season", unique: true },
    );
  });
});
