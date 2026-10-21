import { getDatabase } from "../mongodb.js";

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
    { "league.id": 1, "league.season": 1, "fixture.status.short": 1 },
    { name: "league_season_status" },
  );
  await database.collection("leagueStandings").createIndex(
    { "league.id": 1, "league.season": 1 },
    { name: "unique_league_season", unique: true },
  );
  await database.collection("leagueStats").createIndex(
    { "league.id": 1, "league.season": 1 },
    { name: "unique_league_season", unique: true },
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
  await database.collection("fixtureStatsSnapshots").createIndex(
    { fixtureId: 1 }, { name: "unique_fixture_id", unique: true },
  );
  await database.collection("fullSeasonFixtureSyncStates").createIndex(
    { leagueId: 1, season: 1 },
    { name: "unique_league_season", unique: true },
  );
}
