import type { Bet } from "@black-diamond/core/bet";

import { getDatabase } from "../../mongodb.js";

export const insufficientBalanceErrorCode = "INSUFFICIENT_BALANCE";

function createInsufficientBalanceError() {
  return Object.assign(new Error("Insufficient balance to place this bet."), {
    code: insufficientBalanceErrorCode,
  });
}

export async function placeBet(bet: Bet): Promise<void> {
  const database = await getDatabase();
  const accounts = database.collection("accounts");
  const balanceUpdate = await accounts.updateOne(
    { id: bet.accountId, currentBalance: { $gte: bet.stake } },
    { $inc: { currentBalance: -bet.stake }, $set: { updatedAt: bet.placedAt } },
  );

  if (balanceUpdate.modifiedCount !== 1) throw createInsufficientBalanceError();

  try {
    await database.collection<Bet>("bets").insertOne(bet);
  } catch (error) {
    await accounts.updateOne(
      { id: bet.accountId },
      { $inc: { currentBalance: bet.stake }, $set: { updatedAt: new Date().toISOString() } },
    );
    throw error;
  }
}
