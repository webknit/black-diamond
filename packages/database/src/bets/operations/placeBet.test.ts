import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  withDatabaseTransaction: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
  findOne: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ withDatabaseTransaction: mocks.withDatabaseTransaction }));

import { insufficientBalanceErrorCode, placeBet } from "./placeBet.js";

const bet = {
  id: "bet-1", accountId: "main", selections: [{
    fixture: { id: 1, date: "2026-10-22", homeTeamName: "Home", awayTeamName: "Away" },
    market: { type: "matchWinner" as const, name: "Match Winner", outcome: "home" as const, selection: "Home", line: null },
    referenceOdds: 1.8, referenceOddsSource: "Bet365" as const,
  }], placedOdds: 1.8, stake: 10, matchStatus: "matched" as const, status: "pending" as const,
  returnAmount: null, profit: null, placedAt: "2026-10-22T00:00:00.000Z", settledAt: null,
};

describe("placeBet", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reserves the stake then stores the pending bet", async () => {
    const session = {};
    mocks.withDatabaseTransaction.mockImplementation((operation) =>
      operation({ collection: mocks.collection }, session),
    );
    mocks.collection.mockImplementation((name: string) => name === "accounts"
      ? { updateOne: mocks.updateOne, findOne: mocks.findOne }
      : { insertOne: mocks.insertOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.findOne.mockResolvedValue({ currentBalance: 90 });

    await placeBet(bet);

    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main", currentBalance: { $gte: 10 } },
      { $inc: { currentBalance: -10 }, $set: { updatedAt: bet.placedAt } },
      { session },
    );
    expect(mocks.insertOne).toHaveBeenCalledWith(bet, { session });
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "main",
        type: "bet_stake",
        amount: -10,
        balanceAfter: 90,
        occurredAt: bet.placedAt,
        referenceId: bet.id,
      }),
      { session },
    );
  });

  it("rejects the bet when the account does not have enough balance", async () => {
    mocks.withDatabaseTransaction.mockImplementation((operation) =>
      operation({ collection: mocks.collection }, {}),
    );
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 0 });

    await expect(placeBet(bet)).rejects.toMatchObject({ code: insufficientBalanceErrorCode });
  });

  it("propagates ledger write errors so the transaction is aborted", async () => {
    mocks.withDatabaseTransaction.mockImplementation((operation) =>
      operation({ collection: mocks.collection }, {}),
    );
    mocks.collection.mockImplementation((name: string) => name === "accounts"
      ? { updateOne: mocks.updateOne, findOne: mocks.findOne }
      : { insertOne: mocks.insertOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.findOne.mockResolvedValue({ currentBalance: 90 });
    mocks.insertOne.mockRejectedValue(new Error("Ledger write failed"));

    await expect(placeBet(bet)).rejects.toThrow("Ledger write failed");
  });
});
