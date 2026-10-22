import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), insertOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { createAccount } from "./createAccount.js";

describe("createAccount", () => {
  it("stores the account and its bankroll fields", async () => {
    const account = {
      id: "main", email: "me@example.com", passwordHash: "hash", startingBalance: 100, totalDeposits: 0,
      currentBalance: 100, currency: "GBP" as const, createdAt: "2026-10-22T00:00:00.000Z", updatedAt: "2026-10-22T00:00:00.000Z",
    };
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ insertOne: mocks.insertOne });

    await createAccount(account);

    expect(mocks.collection).toHaveBeenCalledWith("accounts");
    expect(mocks.insertOne).toHaveBeenCalledWith(account);
  });
});
