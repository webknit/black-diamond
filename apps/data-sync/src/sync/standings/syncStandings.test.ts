import { beforeEach, describe, expect, it, vi } from "vitest";

const syncLeagueStandings = vi.hoisted(() => vi.fn());

vi.mock("./syncLeagueStandings.js", () => ({ syncLeagueStandings }));

import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncStandings } from "./syncStandings.js";

describe("syncStandings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("syncs standings for every configured league", async () => {
    await syncStandings();

    expect(syncLeagueStandings).toHaveBeenCalledTimes(selectedLeagues.length);
    expect(syncLeagueStandings).toHaveBeenCalledWith(selectedLeagues[0].id);
  });
});
