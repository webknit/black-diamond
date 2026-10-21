import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

export async function getTeamsWithFixturesOnDate(date: string) {
  const nextDate = new Date(`${date}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const database = await getDatabase();
  const fixtures = await database.collection<Fixture>("fixtures").find({
    "fixture.date": { $gte: `${date}T00:00:00.000Z`, $lt: nextDate.toISOString() },
  }).toArray();
  return fixtures.flatMap((fixture) => [
    { teamId: fixture.teams.home.id, leagueId: fixture.league.id, season: fixture.league.season },
    { teamId: fixture.teams.away.id, leagueId: fixture.league.id, season: fixture.league.season },
  ]);
}
