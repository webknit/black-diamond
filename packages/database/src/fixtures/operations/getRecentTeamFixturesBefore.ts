import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

const completedStatuses = ["FT", "AET", "PEN"];

export async function getRecentTeamFixturesBefore(
  leagueId: number,
  season: number,
  teamId: number,
  timestamp: number,
  venue: "home" | "away" | "overall",
  limit = 5,
): Promise<Fixture[]> {
  const database = await getDatabase();
  const teamFilter = venue === "home"
    ? { "teams.home.id": teamId }
    : venue === "away"
      ? { "teams.away.id": teamId }
      : { $or: [{ "teams.home.id": teamId }, { "teams.away.id": teamId }] };

  return database.collection<Fixture>("fixtures").find({
    "league.id": leagueId,
    "league.season": season,
    "fixture.timestamp": { $lt: timestamp },
    "fixture.status.short": { $in: completedStatuses },
    ...teamFilter,
  }).sort({ "fixture.timestamp": -1 }).limit(limit).toArray();
}
