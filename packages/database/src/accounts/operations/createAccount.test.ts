import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  withDatabaseTransaction: vi.fn(),
  insertOne: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ withDatabaseTransaction: mocks.withDatabaseTransaction }));

import { createAccount } from "./createAccount.js";

describe("createAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withDatabaseTransaction.mockImplementation((operation) =>
      operation({ collection: mocks.collection }, {}),
    );
    mocks.collection.mockReturnValue({ insertOne: mocks.insertOne });
  });

  it("stores the account and opening balance transaction", async () => {
    const account = {
      id: "main", email: "me@example.com", passwordHash: "hash", startingBalance: 100, totalDeposits: 0,
      currentBalance: 100, currency: "GBP" as const, createdAt: "2026-10-22T00:00:00.000Z", updatedAt: "2026-10-22T00:00:00.000Z",
    };
    await createAccount(account);

    expect(mocks.collection).toHaveBeenCalledWith("accounts");
    expect(mocks.insertOne).toHaveBeenCalledWith(account, { session: {} });
    expect(mocks.collection).toHaveBeenCalledWith("balanceTransactions");
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: account.id,
        type: "opening_balance",
        amount: 100,
        balanceAfter: 100,
        occurredAt: account.createdAt,
        referenceId: null,
      }),
      { session: {} },
    );
  });
});
