import type { Fixture } from "@black-diamond/core/fixture";
import type { LeagueStats } from "@black-diamond/core/leagueStats";

import { getDatabase } from "../../mongodb.js";

type LeagueStatsInput = LeagueStats["league"];

type Totals = {
  fixturesPlayed: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalGoals: number;
  homeGoals: number;
  awayGoals: number;
  btts: number;
  over0_5: number;
  over1_5: number;
  over2_5: number;
  under0_5: number;
  under1_5: number;
  under2_5: number;
};

const completedFixtureStatuses = ["FT", "AET", "PEN"];

function countAndPercentage(count: number, fixturesPlayed: number) {
  return {
    count,
    percentage: fixturesPlayed === 0 ? 0 : (count / fixturesPlayed) * 100,
  };
}

export async function calculateLeagueStats(
  league: LeagueStatsInput,
): Promise<LeagueStats> {
  const database = await getDatabase();
  const collection = database.collection<Fixture>("fixtures");

  const [totals] = await collection
    .aggregate<Totals>([
      {
        $match: {
          "league.id": league.id,
          "league.season": league.season,
          "fixture.status.short": { $in: completedFixtureStatuses },
          "goals.home": { $ne: null },
          "goals.away": { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          fixturesPlayed: { $sum: 1 },
          homeWins: { $sum: { $cond: [{ $gt: ["$goals.home", "$goals.away"] }, 1, 0] } },
          awayWins: { $sum: { $cond: [{ $lt: ["$goals.home", "$goals.away"] }, 1, 0] } },
          draws: { $sum: { $cond: [{ $eq: ["$goals.home", "$goals.away"] }, 1, 0] } },
          totalGoals: { $sum: { $add: ["$goals.home", "$goals.away"] } },
          homeGoals: { $sum: "$goals.home" },
          awayGoals: { $sum: "$goals.away" },
          btts: { $sum: { $cond: [{ $and: [{ $gt: ["$goals.home", 0] }, { $gt: ["$goals.away", 0] }] }, 1, 0] } },
          over0_5: { $sum: { $cond: [{ $gt: [{ $add: ["$goals.home", "$goals.away"] }, 0] }, 1, 0] } },
          over1_5: { $sum: { $cond: [{ $gt: [{ $add: ["$goals.home", "$goals.away"] }, 1] }, 1, 0] } },
          over2_5: { $sum: { $cond: [{ $gt: [{ $add: ["$goals.home", "$goals.away"] }, 2] }, 1, 0] } },
          under0_5: { $sum: { $cond: [{ $lt: [{ $add: ["$goals.home", "$goals.away"] }, 1] }, 1, 0] } },
          under1_5: { $sum: { $cond: [{ $lt: [{ $add: ["$goals.home", "$goals.away"] }, 2] }, 1, 0] } },
          under2_5: { $sum: { $cond: [{ $lt: [{ $add: ["$goals.home", "$goals.away"] }, 3] }, 1, 0] } },
        },
      },
    ])
    .toArray();

  const values: Totals = totals ?? {
    fixturesPlayed: 0, homeWins: 0, awayWins: 0, draws: 0, totalGoals: 0,
    homeGoals: 0, awayGoals: 0, btts: 0, over0_5: 0, over1_5: 0, over2_5: 0,
    under0_5: 0, under1_5: 0, under2_5: 0,
  };
  const average = (value: number) => values.fixturesPlayed === 0 ? 0 : value / values.fixturesPlayed;

  return {
    league,
    fixturesPlayed: values.fixturesPlayed,
    results: {
      homeWins: countAndPercentage(values.homeWins, values.fixturesPlayed),
      awayWins: countAndPercentage(values.awayWins, values.fixturesPlayed),
      draws: countAndPercentage(values.draws, values.fixturesPlayed),
    },
    goals: {
      total: values.totalGoals,
      averagePerFixture: average(values.totalGoals),
      homeAveragePerFixture: average(values.homeGoals),
      awayAveragePerFixture: average(values.awayGoals),
    },
    btts: countAndPercentage(values.btts, values.fixturesPlayed),
    over0_5: countAndPercentage(values.over0_5, values.fixturesPlayed),
    over1_5: countAndPercentage(values.over1_5, values.fixturesPlayed),
    over2_5: countAndPercentage(values.over2_5, values.fixturesPlayed),
    under0_5: countAndPercentage(values.under0_5, values.fixturesPlayed),
    under1_5: countAndPercentage(values.under1_5, values.fixturesPlayed),
    under2_5: countAndPercentage(values.under2_5, values.fixturesPlayed),
  };
}
