import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  withDatabaseTransaction: vi.fn(),
  collection: vi.fn(),
  deleteOne: vi.fn(),
  updateOne: vi.fn(),
  findOne: vi.fn(),
  insertOne: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ withDatabaseTransaction: mocks.withDatabaseTransaction }));
import { deleteBet } from "./deleteBet.js";
const bet = { id: "bet", accountId: "main", status: "pending", stake: 10, returnAmount: null } as never;
describe("deleteBet", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refunds a pending bet after deleting it", async () => {
    const session = {};
    mocks.withDatabaseTransaction.mockImplementation((operation) => operation({ collection: mocks.collection }, session));
    mocks.collection.mockImplementation((name: string) => name === "bets"
      ? { deleteOne: mocks.deleteOne }
      : { updateOne: mocks.updateOne, findOne: mocks.findOne, insertOne: mocks.insertOne });
    mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.findOne.mockResolvedValue({ currentBalance: 100 });
    await deleteBet(bet);
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main" },
      expect.objectContaining({ $inc: { currentBalance: 10 } }),
      { session },
    );
    expect(mocks.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ type: "bet_reversal", amount: 10, balanceAfter: 100, referenceId: "bet" }),
      { session },
    );
  });

  it("refunds the original stake when deleting a lost bet", async () => {
    mocks.withDatabaseTransaction.mockImplementation((operation) => operation({ collection: mocks.collection }, {}));
    mocks.collection.mockImplementation((name: string) => name === "bets"
      ? { deleteOne: mocks.deleteOne }
      : { updateOne: mocks.updateOne, findOne: mocks.findOne, insertOne: mocks.insertOne });
    mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.findOne.mockResolvedValue({ currentBalance: 100 });
    await deleteBet({ id: "bet", accountId: "main", status: "lost", stake: 10, returnAmount: null } as never);
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main" },
      expect.objectContaining({ $inc: { currentBalance: 10 } }),
      { session: expect.anything() },
    );
  });

  it("reverses both the stake and the credited return when deleting a won bet", async () => {
    mocks.withDatabaseTransaction.mockImplementation((operation) => operation({ collection: mocks.collection }, {}));
    mocks.collection.mockImplementation((name: string) => name === "bets"
      ? { deleteOne: mocks.deleteOne }
      : { updateOne: mocks.updateOne, findOne: mocks.findOne, insertOne: mocks.insertOne });
    mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.findOne.mockResolvedValue({ currentBalance: 90 });
    await deleteBet({ id: "bet", accountId: "main", status: "won", stake: 10, returnAmount: 20 } as never);
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main" },
      expect.objectContaining({ $inc: { currentBalance: -10 } }),
      { session: expect.anything() },
    );
  });
});
