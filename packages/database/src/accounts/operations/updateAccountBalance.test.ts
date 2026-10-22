import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { updateAccountBalance } from "./updateAccountBalance.js";

describe("updateAccountBalance", () => {
  it("updates the balance after a betting action", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });

    await updateAccountBalance("main", 90, "2026-10-22T00:00:00.000Z");

    expect(mocks.updateOne).toHaveBeenCalledWith(
      { id: "main" },
      { $set: { currentBalance: 90, updatedAt: "2026-10-22T00:00:00.000Z" } },
    );
  });
});
