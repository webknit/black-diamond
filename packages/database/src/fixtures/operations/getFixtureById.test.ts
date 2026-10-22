import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), findOne: vi.fn(), getDatabase: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFixtureById } from "./getFixtureById.js";

describe("getFixtureById", () => {
  it("finds the fixture used for a bet", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue({ fixture: { id: 123 } });

    await expect(getFixtureById(123)).resolves.toEqual({ fixture: { id: 123 } });
    expect(mocks.findOne).toHaveBeenCalledWith({ "fixture.id": 123 });
  });
});
