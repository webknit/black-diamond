import type { StrategyResult } from "@black-diamond/core/strategyResult";
import { getDatabase } from "../../mongodb.js";

export type StrategyResultPerformance = {
  strategyId: string;
  bets: number;
  wins: number;
  profit: number;
};

export async function getStrategyResultPerformances(
  minimumFixtureTimestamp?: number,
  maximumFixtureTimestamp?: number,
): Promise<StrategyResultPerformance[]> {
  const database = await getDatabase();
  return database.collection<StrategyResult>("strategyResults").aggregate<StrategyResultPerformance>([
    {
      $match: {
        strategyVersion: 1,
        eligible: true,
        ...(minimumFixtureTimestamp === undefined && maximumFixtureTimestamp === undefined
          ? {}
          : {
              fixtureTimestamp: {
                ...(minimumFixtureTimestamp === undefined ? {} : { $gte: minimumFixtureTimestamp }),
                ...(maximumFixtureTimestamp === undefined ? {} : { $lt: maximumFixtureTimestamp }),
              },
            }),
      },
    },
    {
      $group: {
        _id: "$strategyId",
        bets: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ["$result", "won"] }, 1, 0] } },
        profit: { $sum: "$profit" },
      },
    },
    { $project: { _id: 0, strategyId: "$_id", bets: 1, wins: 1, profit: 1 } },
  ]).toArray();
}

export async function getStrategyResultFixtureTimestamps(): Promise<number[]> {
  const database = await getDatabase();
  return database.collection<StrategyResult>("strategyResults").distinct("fixtureTimestamp", {
    strategyId: "bothTeamsAboveLeagueAverage",
    strategyVersion: 1,
  });
}
