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
    expect(mocks.collection).toHaveBeenNthCalledWith(8, "teamStats");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      8,
      { "team.id": 1, "league.id": 1, "league.season": 1 },
      { name: "unique_team_league_season", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(9, "predictions");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      9,
      { fixtureId: 1 },
      { name: "unique_fixture_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(10, "fixtureOdds");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      10,
      { fixtureId: 1 },
      { name: "unique_fixture_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(11, "fixtureStatsSnapshots");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      11,
      { fixtureId: 1 },
      { name: "unique_fixture_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(12, "fullSeasonFixtureSyncStates");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      12,
      { leagueId: 1, season: 1 },
      { name: "unique_league_season", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(13, "syncRunStates");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      13,
      { run: 1 },
      { name: "unique_sync_run", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(14, "accounts");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      14,
      { id: 1 },
      { name: "unique_account_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(15, "accounts");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      15,
      { email: 1 },
      { name: "unique_account_email", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(16, "bets");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      16,
      { id: 1 },
      { name: "unique_bet_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(17, "bets");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      17,
      { accountId: 1, status: 1, "selections.fixture.id": 1 },
      { name: "account_status_selection_fixture" },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(18, "bets");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      18,
      { accountId: 1, placedAt: -1, id: -1 },
      { name: "account_bet_placed_at" },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(19, "balanceTransactions");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      19,
      { id: 1 },
      { name: "unique_balance_transaction_id", unique: true },
    );
    expect(mocks.collection).toHaveBeenNthCalledWith(20, "balanceTransactions");
    expect(mocks.createIndex).toHaveBeenNthCalledWith(
      20,
      { accountId: 1, occurredAt: 1, id: 1 },
      { name: "account_balance_transaction_date" },
    );
  });
});
