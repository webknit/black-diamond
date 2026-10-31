import type { Fixture } from "@black-diamond/core/fixture";

import { getDatabase } from "../../mongodb.js";

const completedStatuses = ["FT", "AET", "PEN"];

export async function getTeamFixtureResearch(
  teamId: number,
  leagueId: number,
  season: number,
  now = new Date(),
): Promise<{ recent: Fixture[]; upcoming: Fixture[] }> {
  const database = await getDatabase();
  const fixtures = database.collection<Fixture>("fixtures");
  const teamFilter = {
    $or: [{ "teams.home.id": teamId }, { "teams.away.id": teamId }],
  };
  const leagueFilter = {
    "league.id": leagueId,
    "league.season": season,
    ...teamFilter,
  };
  const nowTimestamp = Math.floor(now.getTime() / 1000);

  const [recent, upcoming] = await Promise.all([
    fixtures
      .find({
        ...leagueFilter,
        "fixture.status.short": { $in: completedStatuses },
      }, { projection: { _id: 0 } })
      .sort({ "fixture.timestamp": -1 })
      .limit(5)
      .toArray(),
    fixtures
      .find({
        ...leagueFilter,
        "fixture.status.short": "NS",
        "fixture.timestamp": { $gte: nowTimestamp },
      }, { projection: { _id: 0 } })
      .sort({ "fixture.timestamp": 1 })
      .limit(5)
      .toArray(),
  ]);

  return { recent, upcoming };
}
