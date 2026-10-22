import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getDatabase: vi.fn(), collection: vi.fn(), deleteOne: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { deleteBet } from "./deleteBet.js";
const bet = { id: "bet", accountId: "main", status: "pending", stake: 10, returnAmount: null } as never;
describe("deleteBet", () => {
  it("refunds a pending bet after deleting it", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection }); mocks.collection.mockImplementation((name: string) => name === "bets" ? { deleteOne: mocks.deleteOne } : { updateOne: mocks.updateOne }); mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
    await deleteBet(bet);
    expect(mocks.updateOne).toHaveBeenCalledWith({ id: "main" }, expect.objectContaining({ $inc: { currentBalance: 10 } }));
  });

  it("refunds the original stake when deleting a lost bet", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection }); mocks.collection.mockImplementation((name: string) => name === "bets" ? { deleteOne: mocks.deleteOne } : { updateOne: mocks.updateOne }); mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
    await deleteBet({ id: "bet", accountId: "main", status: "lost", stake: 10, returnAmount: null } as never);
    expect(mocks.updateOne).toHaveBeenCalledWith({ id: "main" }, expect.objectContaining({ $inc: { currentBalance: 10 } }));
  });

  it("reverses both the stake and the credited return when deleting a won bet", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection }); mocks.collection.mockImplementation((name: string) => name === "bets" ? { deleteOne: mocks.deleteOne } : { updateOne: mocks.updateOne }); mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
    await deleteBet({ id: "bet", accountId: "main", status: "won", stake: 10, returnAmount: 20 } as never);
    expect(mocks.updateOne).toHaveBeenCalledWith({ id: "main" }, expect.objectContaining({ $inc: { currentBalance: -10 } }));
  });
});
