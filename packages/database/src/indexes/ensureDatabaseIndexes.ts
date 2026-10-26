import { getDatabase } from "../mongodb.js";
import { MongoServerError } from "mongodb";

export async function ensureDatabaseIndexes(): Promise<void> {
  const database = await getDatabase();

  await database.collection("leagues").createIndex(
    { "league.id": 1 },
    { name: "unique_league_id", unique: true },
  );
  await database.collection("teams").createIndex(
    { "team.id": 1 },
    { name: "unique_team_id", unique: true },
  );
  await database.collection("leagueTeams").createIndex(
    { leagueId: 1, season: 1, teamId: 1 },
    { name: "unique_league_season_team", unique: true },
  );
  await database.collection("fixtures").createIndex(
    { "fixture.id": 1 },
    { name: "unique_fixture_id", unique: true },
  );
  await database.collection("fixtures").createIndex(
    { "fixture.date": 1 },
    { name: "fixture_date" },
  );
  await database.collection("fixtures").createIndex(
    { "league.id": 1, "league.season": 1, "fixture.status.short": 1 },
    { name: "league_season_status" },
  );
  await database.collection("fixtures").createIndex(
    { "fixture.timestamp": 1, "fixture.status.short": 1 },
    { name: "fixture_timestamp_status" },
  );
  await database.collection("fixtures").createIndex(
    { "league.id": 1, "fixture.status.short": 1, "fixture.timestamp": 1 },
    { name: "league_status_timestamp" },
  );
  await database.collection("fixtures").createIndex(
    { "league.id": 1, "league.season": 1, "fixture.timestamp": 1 },
    { name: "league_season_timestamp" },
  );
  await database.collection("leagueStandings").createIndex(
    { "league.id": 1, "league.season": 1 },
    { name: "unique_league_season", unique: true },
  );
  const leagueStats = database.collection("leagueStats");

  try {
    await leagueStats.dropIndex("unique_league_season");
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 27) throw error;
  }

  await leagueStats.createIndex(
    { "league.id": 1, "league.season": 1, round: 1 },
    { name: "unique_league_season_round", unique: true },
  );
  await database.collection("teamStats").createIndex(
    { "team.id": 1, "league.id": 1, "league.season": 1 },
    { name: "unique_team_league_season", unique: true },
  );
  await database.collection("predictions").createIndex(
    { fixtureId: 1 }, { name: "unique_fixture_id", unique: true },
  );
  await database.collection("fixtureOdds").createIndex(
    { fixtureId: 1 }, { name: "unique_fixture_id", unique: true },
  );
  await database.collection("fixtureEvents").createIndex(
    { fixtureId: 1 }, { name: "unique_fixture_id", unique: true },
  );
  await database.collection("fixtureStatsSnapshots").createIndex(
    { fixtureId: 1 }, { name: "unique_fixture_id", unique: true },
  );
  await database.collection("strategyResults").createIndex(
    { fixtureId: 1, strategyId: 1, strategyVersion: 1 },
    { name: "unique_fixture_strategy_version", unique: true },
  );
  await database.collection("strategyPerformances").createIndex(
    { strategyId: 1, strategyVersion: 1, "league.id": 1, season: 1 },
    { name: "unique_strategy_league_season", unique: true },
  );
  await database.collection("strategyResults").createIndex(
    { strategyVersion: 1, eligible: 1, fixtureTimestamp: 1, strategyId: 1 },
    { name: "strategy_version_eligibility_timestamp" },
  );
  await database.collection("fullSeasonFixtureSyncStates").createIndex(
    { leagueId: 1, season: 1 },
    { name: "unique_league_season", unique: true },
  );
  await database.collection("syncRunStates").createIndex(
    { run: 1 },
    { name: "unique_sync_run", unique: true },
  );
  await database.collection("accounts").createIndex(
    { id: 1 }, { name: "unique_account_id", unique: true },
  );
  await database.collection("accounts").createIndex(
    { email: 1 }, { name: "unique_account_email", unique: true },
  );
  await database.collection("bets").createIndex(
    { id: 1 }, { name: "unique_bet_id", unique: true },
  );
  await database.collection("bets").createIndex(
    { accountId: 1, status: 1, "selections.fixture.id": 1 },
    { name: "account_status_selection_fixture" },
  );
  await database.collection("bets").createIndex(
    { accountId: 1, "selections.fixture.id": 1 },
    { name: "account_selection_fixture" },
  );
  await database.collection("bets").createIndex(
    { accountId: 1, placedAt: -1, id: -1 },
    { name: "account_bet_placed_at" },
  );
  await database.collection("balanceTransactions").createIndex(
    { id: 1 }, { name: "unique_balance_transaction_id", unique: true },
  );
  await database.collection("balanceTransactions").createIndex(
    { accountId: 1, occurredAt: 1, id: 1 },
    { name: "account_balance_transaction_date" },
  );
}
