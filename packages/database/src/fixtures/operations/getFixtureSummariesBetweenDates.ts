import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

type FixtureSummaryProjection = {
  fixture: {
    id: number;
    timestamp: number;
    venue: { name: string | null; city: string | null };
    status: { long: string; short: string; elapsed: number | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    round: string | null;
		season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
};

export async function getFixtureSummariesBetweenDates(startDate: string, endDate: string) {
  const database = await getDatabase();
  return database
    .collection<Fixture>("fixtures")
    .find<FixtureSummaryProjection>(
      {
        "fixture.date": {
          $gte: `${startDate}T00:00:00.000Z`,
          $lt: `${endDate}T00:00:00.000Z`,
        },
      },
      {
        projection: {
          _id: 0,
          "fixture.id": 1,
          "fixture.timestamp": 1,
          "fixture.venue.name": 1,
          "fixture.venue.city": 1,
          "fixture.status.long": 1,
          "fixture.status.short": 1,
          "fixture.status.elapsed": 1,
          "league.id": 1,
          "league.name": 1,
          "league.country": 1,
          "league.logo": 1,
          "league.round": 1,
					"league.season": 1,
          "teams.home.name": 1,
					"teams.home.id": 1,
          "teams.home.logo": 1,
          "teams.away.name": 1,
					"teams.away.id": 1,
          "teams.away.logo": 1,
          "goals.home": 1,
          "goals.away": 1,
        },
      },
    )
    .toArray();
}
