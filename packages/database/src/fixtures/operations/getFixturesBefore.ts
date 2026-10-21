import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";
export async function getFixturesBefore(leagueId: number, season: number, timestamp: number) {
  const database = await getDatabase();
  return database.collection<Fixture>("fixtures").find({ "league.id": leagueId, "league.season": season, "fixture.timestamp": { $lt: timestamp }, "fixture.status.short": { $in: ["FT", "AET", "PEN"] } }).toArray();
}
