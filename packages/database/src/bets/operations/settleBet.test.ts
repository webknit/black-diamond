import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  withDatabaseTransaction: vi.fn(),
  updateOne: vi.fn(),
  findOne: vi.fn(),
  insertOne: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ withDatabaseTransaction: mocks.withDatabaseTransaction }));

import { settleBet } from "./settleBet.js";

const bet = {
  id: "bet-1",
  accountId: "main",
  stake: 10,
  placedOdds: 2,
} as never;

describe("settleBet", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records a payout with the resulting account balance", async () => {
    const session = {};
    mocks.withDatabaseTransaction.mockImplementation((operation) =>
      operation({ collection: mocks.collection }, session),
    );
    mocks.collection.mockReturnValue({
      updateOne: mocks.updateOne,
      findOne: mocks.findOne,
      insertOne: mocks.insertOne,
    });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.findOne.mockResolvedValue({ currentBalance: 110 });

    await expect(settleBet(bet, "won", "2026-10-22T00:00:00.000Z")).resolves.toBe(true);

    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      2,
      { id: "main" },
      { $inc: { currentBalance: 20 }, $set: { updatedAt: "2026-10-22T00:00:00.000Z" } },
      { session },
    );
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "main",
        type: "bet_payout",
        amount: 20,
        balanceAfter: 110,
        occurredAt: "2026-10-22T00:00:00.000Z",
        referenceId: "bet-1",
      }),
      { session },
    );
  });

  it("does not record a balance change when the bet loses", async () => {
    const session = {};
    mocks.withDatabaseTransaction.mockImplementation((operation) =>
      operation({ collection: mocks.collection }, session),
    );
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await expect(settleBet(bet, "lost", "2026-10-22T00:00:00.000Z")).resolves.toBe(true);

    expect(mocks.collection).toHaveBeenCalledTimes(1);
  });
});
