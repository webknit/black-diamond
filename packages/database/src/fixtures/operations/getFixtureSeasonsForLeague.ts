import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

export async function getFixtureSeasonsForLeague(leagueId: number): Promise<number[]> {
  const database = await getDatabase();

  return database
    .collection<Fixture>("fixtures")
    .distinct("league.season", { "league.id": leagueId })
    .then((seasons) => seasons.sort((left, right) => left - right));
}
