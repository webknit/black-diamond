import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  withDatabaseTransaction: vi.fn(),
  findOne: vi.fn(),
  updateOne: vi.fn(),
  insertOne: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ withDatabaseTransaction: mocks.withDatabaseTransaction }));

import { updateAccountBalance } from "./updateAccountBalance.js";

describe("updateAccountBalance", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records an adjustment when the balance changes", async () => {
    const session = {};
    mocks.withDatabaseTransaction.mockImplementation((operation) =>
      operation({ collection: mocks.collection }, session),
    );
    mocks.collection.mockReturnValue({
      findOne: mocks.findOne,
      updateOne: mocks.updateOne,
      insertOne: mocks.insertOne,
    });
    mocks.findOne.mockResolvedValue({ currentBalance: 100 });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await updateAccountBalance("main", 90, "2026-10-22T00:00:00.000Z");

    expect(mocks.findOne).toHaveBeenCalledWith(
      { id: "main" },
      { session, projection: { _id: 0, currentBalance: 1 } },
    );
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main" },
      { $set: { currentBalance: 90, updatedAt: "2026-10-22T00:00:00.000Z" } },
      { session },
    );
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "main",
        type: "adjustment",
        amount: -10,
        balanceAfter: 90,
        occurredAt: "2026-10-22T00:00:00.000Z",
        referenceId: null,
      }),
      { session },
    );
  });
});
