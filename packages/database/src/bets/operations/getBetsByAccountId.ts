import type { Bet } from "@black-diamond/core/bet";
import { getDatabase } from "../../mongodb.js";

export async function getBetsByAccountId(accountId: string) {
  const database = await getDatabase();
  return database
    .collection<Bet>("bets")
    .find({ accountId }, { projection: { _id: 0 } })
    .sort({ placedAt: -1 })
    .toArray();
}

export async function getBetsPage(
  accountId: string,
  page: number,
  pageSize: number,
  dateRange?: { from: string; to: string },
) {
  const database = await getDatabase();
  const filter = {
    accountId,
    ...(dateRange ? { placedAt: { $gte: dateRange.from, $lt: dateRange.to } } : {}),
  };
  const bets = database.collection<Bet>("bets");
  const totalCount = await bets.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const actualPage = Math.min(page, totalPages);
  const items = await bets
    .find(filter, { projection: { _id: 0 } })
    .sort({ placedAt: -1, id: -1 })
    .skip((actualPage - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return { items, totalCount, page: actualPage };
}

export type BetPeriodSummary = {
  betCount: number;
  totalStake: number;
  totalReturned: number;
  settledProfitLoss: number;
  settledBetCount: number;
  averageOdds: number | null;
};

export async function getBetPeriodSummary(
  accountId: string,
  dateRange?: { from: string; to: string },
): Promise<BetPeriodSummary> {
  const database = await getDatabase();
  const filter = {
    accountId,
    ...(dateRange ? { placedAt: { $gte: dateRange.from, $lt: dateRange.to } } : {}),
  };
  const [summary] = await database.collection<Bet>("bets").aggregate<BetPeriodSummary>([
    { $match: filter },
    {
      $group: {
        _id: null,
        betCount: { $sum: 1 },
        totalStake: { $sum: "$stake" },
        totalReturned: { $sum: { $ifNull: ["$returnAmount", 0] } },
        settledProfitLoss: {
          $sum: {
            $cond: [
              { $ne: ["$status", "pending"] },
              { $ifNull: ["$profit", 0] },
              0,
            ],
          },
        },
        settledBetCount: {
          $sum: { $cond: [{ $ne: ["$status", "pending"] }, 1, 0] },
        },
        averageOdds: { $avg: "$placedOdds" },
      },
    },
    { $project: { _id: 0 } },
  ]).toArray();

  return summary ?? {
    betCount: 0,
    totalStake: 0,
    totalReturned: 0,
    settledProfitLoss: 0,
    settledBetCount: 0,
    averageOdds: null,
  };
}

export async function getBetByIdAndAccountId(betId: string, accountId: string) {
  const database = await getDatabase();
  return database.collection<Bet>("bets").findOne(
    { id: betId, accountId },
    { projection: { _id: 0 } },
  );
}
