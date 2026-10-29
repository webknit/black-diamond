import { getDatabase } from "../../mongodb.js";

export async function getFixtureTeamNewsAvailability(fixtureIds: number[]) {
  if (fixtureIds.length === 0) return new Set<number>();

  const database = await getDatabase();
  const [injuries, lineups] = await Promise.all([
    database
      .collection<{ fixtureId: number }>("fixtureInjuries")
      .find(
        { fixtureId: { $in: fixtureIds }, "injuries.0": { $exists: true } },
        { projection: { _id: 0, fixtureId: 1 } },
      )
      .toArray(),
    database
      .collection<{ fixtureId: number }>("fixtureLineups")
      .find(
        { fixtureId: { $in: fixtureIds }, "lineups.startXI.0": { $exists: true } },
        { projection: { _id: 0, fixtureId: 1 } },
      )
      .toArray(),
  ]);

  return new Set([...injuries, ...lineups].map((item) => item.fixtureId));
}
