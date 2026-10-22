import { getDatabase } from "../../mongodb.js";

export type FixtureScoreSummary = {
  fixtureId: number;
  home: number | null;
  away: number | null;
};

export async function getFixtureScoresByIds(fixtureIds: number[]): Promise<FixtureScoreSummary[]> {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection("fixtures")
    .find<{ fixture: { id: number }; goals: { home: number | null; away: number | null } }>(
      { "fixture.id": { $in: fixtureIds } },
      {
        projection: {
          _id: 0,
          "fixture.id": 1,
          "goals.home": 1,
          "goals.away": 1,
        },
      },
    )
    .map((fixture) => ({
      fixtureId: fixture.fixture.id,
      home: fixture.goals.home,
      away: fixture.goals.away,
    }))
    .toArray();
}
