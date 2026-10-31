import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), findOne: vi.fn(), getDatabase: vi.fn() }));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getTeamById } from "./getTeamById.js";

describe("getTeamById", () => {
  it("finds a team by its API-Football ID", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ findOne: mocks.findOne });
    mocks.findOne.mockResolvedValue(null);

    await getTeamById(33);

    expect(mocks.findOne).toHaveBeenCalledWith(
      { "team.id": 33 },
      { projection: { _id: 0 } },
    );
  });
});
