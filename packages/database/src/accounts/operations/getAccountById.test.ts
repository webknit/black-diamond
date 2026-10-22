import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), findOne: vi.fn(), getDatabase: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getAccountById } from "./getAccountById.js";

describe("getAccountById", () => {
  it("finds the account attached to a session", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue({ id: "main" });

    await expect(getAccountById("main")).resolves.toEqual({ id: "main" });
    expect(mocks.findOne).toHaveBeenCalledWith({ id: "main" });
  });
});
