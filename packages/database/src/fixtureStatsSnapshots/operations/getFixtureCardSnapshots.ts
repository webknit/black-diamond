import type {
  FixtureStatsRecord,
  FixtureStatsSnapshot,
} from "@black-diamond/core/fixtureStatsSnapshot";
import { getDatabase } from "../../mongodb.js";

type FixtureCardSnapshot = {
  fixtureId: number;
  home: HomeTeamStats;
  away: AwayTeamStats;
};

type TeamStats = {
  leaguePosition: number | null;
  leagueTeams: number;
  form: string;
  cleanSheets: { home: number; away: number; total: number };
  summary: { wins: { percentage: number }; draws: { percentage: number } };
};

type VenueFixtureStats = Pick<
  FixtureStatsRecord,
  "played" | "wins" | "draws" | "loses" | "goalsFor" | "goalsAgainst"
>;
type FixtureGoals = Pick<FixtureStatsRecord, "goalsFor" | "goalsAgainst">;
type OverallFixtureStats = Pick<FixtureStatsRecord, "played" | "goalsFor" | "goalsAgainst">;

type HomeTeamStats = TeamStats & {
  formHome: string;
  fixtures: {
    home: VenueFixtureStats;
    away: FixtureGoals;
    total: OverallFixtureStats;
  };
};

type AwayTeamStats = TeamStats & {
  formAway: string;
  fixtures: {
    home: FixtureGoals;
    away: VenueFixtureStats;
    total: OverallFixtureStats;
  };
};

export async function getFixtureCardSnapshots(fixtureIds: number[]) {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureStatsSnapshot>("fixtureStatsSnapshots")
    .find<FixtureCardSnapshot>(
      { fixtureId: { $in: fixtureIds } },
      {
        projection: {
          _id: 0,
          fixtureId: 1,
          "home.leaguePosition": 1,
          "home.leagueTeams": 1,
          "home.form": 1,
          "home.formHome": 1,
          "home.fixtures.home.played": 1,
          "home.fixtures.home.wins": 1,
          "home.fixtures.home.draws": 1,
          "home.fixtures.home.loses": 1,
          "home.fixtures.home.goalsFor": 1,
          "home.fixtures.home.goalsAgainst": 1,
          "home.fixtures.away.goalsFor": 1,
          "home.fixtures.away.goalsAgainst": 1,
          "home.fixtures.total.played": 1,
          "home.fixtures.total.goalsFor": 1,
          "home.fixtures.total.goalsAgainst": 1,
          "home.cleanSheets.home": 1,
          "home.cleanSheets.away": 1,
          "home.cleanSheets.total": 1,
          "home.summary.wins.percentage": 1,
          "home.summary.draws.percentage": 1,
          "away.leaguePosition": 1,
          "away.leagueTeams": 1,
          "away.form": 1,
          "away.formAway": 1,
          "away.fixtures.home.goalsFor": 1,
          "away.fixtures.home.goalsAgainst": 1,
          "away.fixtures.away.played": 1,
          "away.fixtures.away.wins": 1,
          "away.fixtures.away.draws": 1,
          "away.fixtures.away.loses": 1,
          "away.fixtures.away.goalsFor": 1,
          "away.fixtures.away.goalsAgainst": 1,
          "away.fixtures.total.played": 1,
          "away.fixtures.total.goalsFor": 1,
          "away.fixtures.total.goalsAgainst": 1,
          "away.cleanSheets.home": 1,
          "away.cleanSheets.away": 1,
          "away.cleanSheets.total": 1,
          "away.summary.wins.percentage": 1,
          "away.summary.draws.percentage": 1,
        },
      },
    )
    .toArray();
}
