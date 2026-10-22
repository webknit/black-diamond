import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { addAccountDeposit } from "./addAccountDeposit.js";

describe("addAccountDeposit", () => {
  it("adds deposits to both balance and contributed capital", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await expect(addAccountDeposit("main", 50, "2026-10-22T00:00:00.000Z")).resolves.toBe(true);

    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main" },
      {
        $inc: { currentBalance: 50, totalDeposits: 50 },
        $set: { updatedAt: "2026-10-22T00:00:00.000Z" },
      },
    );
  });

  it("rejects invalid deposit amounts", async () => {
    await expect(addAccountDeposit("main", 0, "2026-10-22T00:00:00.000Z")).rejects.toThrow(
      "Deposit amount must be a positive finite number",
    );
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
