import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  withDatabaseTransaction: vi.fn(),
  updateOne: vi.fn(),
  findOne: vi.fn(),
  insertOne: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ withDatabaseTransaction: mocks.withDatabaseTransaction }));

import { addAccountDeposit } from "./addAccountDeposit.js";

describe("addAccountDeposit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds deposits to both balance and contributed capital", async () => {
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
    mocks.findOne.mockResolvedValue({ currentBalance: 150 });

    await expect(addAccountDeposit("main", 50, "2026-10-22T00:00:00.000Z")).resolves.toBe(true);

    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main" },
      {
        $inc: { currentBalance: 50, totalDeposits: 50 },
        $set: { updatedAt: "2026-10-22T00:00:00.000Z" },
      },
      { session },
    );
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "main",
        type: "deposit",
        amount: 50,
        balanceAfter: 150,
        occurredAt: "2026-10-22T00:00:00.000Z",
        referenceId: null,
      }),
      { session },
    );
  });

  it("rejects invalid deposit amounts", async () => {
    await expect(addAccountDeposit("main", 0, "2026-10-22T00:00:00.000Z")).rejects.toThrow(
      "Deposit amount must be a positive finite number",
    );
    expect(mocks.withDatabaseTransaction).not.toHaveBeenCalled();
  });
});
