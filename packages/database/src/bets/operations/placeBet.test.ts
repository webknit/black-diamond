import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), insertOne: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { insufficientBalanceErrorCode, placeBet } from "./placeBet.js";

const bet = {
  id: "bet-1", accountId: "main", selections: [{
    fixture: { id: 1, date: "2026-10-22", homeTeamName: "Home", awayTeamName: "Away" },
    market: { type: "matchWinner" as const, name: "Match Winner", outcome: "home" as const, selection: "Home", line: null },
    referenceOdds: 1.8, referenceOddsSource: "Bet365" as const,
  }], placedOdds: 1.8, stake: 10, status: "pending" as const,
  returnAmount: null, profit: null, placedAt: "2026-10-22T00:00:00.000Z", settledAt: null,
};

describe("placeBet", () => {
  it("reserves the stake then stores the pending bet", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockImplementation((name: string) => name === "accounts"
      ? { updateOne: mocks.updateOne }
      : { insertOne: mocks.insertOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await placeBet(bet);

    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main", currentBalance: { $gte: 10 } },
      { $inc: { currentBalance: -10 }, $set: { updatedAt: bet.placedAt } },
    );
    expect(mocks.insertOne).toHaveBeenCalledWith(bet);
  });

  it("rejects the bet when the account does not have enough balance", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 0 });

    await expect(placeBet(bet)).rejects.toMatchObject({ code: insufficientBalanceErrorCode });
  });

  it("restores the reserved stake when storing the bet fails", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockImplementation((name: string) => name === "accounts"
      ? { updateOne: mocks.updateOne }
      : { insertOne: mocks.insertOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.insertOne.mockRejectedValue(new Error("Mongo write failed"));

    await expect(placeBet(bet)).rejects.toThrow("Mongo write failed");

    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      2,
      { id: "main" },
      expect.objectContaining({ $inc: { currentBalance: 10 } }),
    );
  });
});
