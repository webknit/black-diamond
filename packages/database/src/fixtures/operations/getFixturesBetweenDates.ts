import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";
export async function getFixturesBetweenDates(startDate: string, endDate: string) {
  const database = await getDatabase();
  return database.collection<Fixture>("fixtures").find({
    "fixture.date": { $gte: `${startDate}T00:00:00.000Z`, $lt: `${endDate}T00:00:00.000Z` },
  }).toArray();
}
