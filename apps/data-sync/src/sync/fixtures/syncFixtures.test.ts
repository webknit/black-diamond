import { beforeEach, describe, expect, it, vi } from "vitest";

const syncCurrentSeasonFixtures = vi.hoisted(() => vi.fn());
vi.mock("./syncCurrentSeasonFixtures.js", () => ({ syncCurrentSeasonFixtures }));

import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncFixtures } from "./syncFixtures.js";

describe("syncFixtures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("syncs fixtures for every configured league", async () => {
    await syncFixtures();

    expect(syncCurrentSeasonFixtures).toHaveBeenCalledTimes(selectedLeagues.length);
    expect(syncCurrentSeasonFixtures).toHaveBeenCalledWith(selectedLeagues[0].id);
  });
});
