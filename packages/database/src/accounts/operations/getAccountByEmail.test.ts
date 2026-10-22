import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), findOne: vi.fn(), getDatabase: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getAccountByEmail } from "./getAccountByEmail.js";

describe("getAccountByEmail", () => {
  it("finds the account used to sign in", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue({ id: "main" });

    await expect(getAccountByEmail("me@example.com")).resolves.toEqual({ id: "main" });
    expect(mocks.findOne).toHaveBeenCalledWith({ email: "me@example.com" });
  });
});
