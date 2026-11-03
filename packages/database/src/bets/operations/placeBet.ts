import type { Bet } from "@black-diamond/core/bet";
import type { FixtureWatchlistEntry } from "@black-diamond/core/fixtureWatchlist";

import { withDatabaseTransaction } from "../../mongodb.js";
import { recordBalanceTransaction } from "../../balanceTransactions/recordBalanceTransaction.js";

export const insufficientBalanceErrorCode = "INSUFFICIENT_BALANCE";

function createInsufficientBalanceError() {
  return Object.assign(new Error("Insufficient balance to place this bet."), {
    code: insufficientBalanceErrorCode,
  });
}

export async function placeBet(bet: Bet, watchFixtures = true): Promise<void> {
  await withDatabaseTransaction(async (database, session) => {
    const accounts = database.collection("accounts");
    const balanceUpdate = await accounts.updateOne(
      { id: bet.accountId, currentBalance: { $gte: bet.stake } },
      { $inc: { currentBalance: -bet.stake }, $set: { updatedAt: bet.placedAt } },
      { session },
    );

    if (balanceUpdate.modifiedCount !== 1) throw createInsufficientBalanceError();

    const account = await accounts.findOne(
      { id: bet.accountId },
      { session, projection: { _id: 0, currentBalance: 1 } },
    );
    if (!account) throw new Error(`Account ${bet.accountId} disappeared while placing a bet`);

    await database.collection<Bet>("bets").insertOne(bet, { session });
    if (watchFixtures) {
      const fixtureIds = [...new Set(bet.selections.map((selection) => selection.fixture.id))];
      await database.collection<FixtureWatchlistEntry>("fixtureWatchlist").bulkWrite(
        fixtureIds.map((fixtureId) => ({
          updateOne: {
            filter: { accountId: bet.accountId, fixtureId },
            update: { $setOnInsert: { accountId: bet.accountId, fixtureId, savedAt: bet.placedAt } },
            upsert: true,
          },
        })),
        { session },
      );
    }
    await recordBalanceTransaction(database, session, {
      accountId: bet.accountId,
      type: "bet_stake",
      amount: -bet.stake,
      balanceAfter: account.currentBalance,
      occurredAt: bet.placedAt,
      referenceId: bet.id,
    });
  });
}
