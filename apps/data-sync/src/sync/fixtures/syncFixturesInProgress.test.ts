import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  upsertFixtures: vi.fn(),
}));

vi.mock("@black-diamond/database/fixtures", () => ({
  upsertFixtures: mocks.upsertFixtures,
}));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { selectedLeagues } from "../../config/selectedLeagues.js";
import { syncFixturesInProgress } from "./syncFixturesInProgress.js";

describe("syncFixturesInProgress", () => {
  it("fetches and stores fixtures currently in progress for selected leagues", async () => {
    const fixtures = [{ fixture: { id: 10 } }];
    mocks.get.mockResolvedValue({ response: fixtures });

    await expect(syncFixturesInProgress()).resolves.toBe(fixtures);

    expect(mocks.get).toHaveBeenCalledWith("/fixtures", {
      live: selectedLeagues.map((league) => league.id).join("-"),
    });
    expect(mocks.upsertFixtures).toHaveBeenCalledWith(fixtures);
  });
});
