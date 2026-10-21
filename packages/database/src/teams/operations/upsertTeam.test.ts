import type { Team } from "@black-diamond/core/team";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  getDatabase: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertTeam } from "./upsertTeam.js";

describe("upsertTeam", () => {
  it("upserts a team using its API-Football ID", async () => {
    const team = { team: { id: 33 } } as Team;

    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });

    await upsertTeam(team);

    expect(mocks.collection).toHaveBeenCalledWith("teams");
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { "team.id": 33 },
      { $set: team },
      { upsert: true },
    );
  });
});
