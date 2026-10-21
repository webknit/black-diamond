import { beforeEach, describe, expect, it, vi } from "vitest";

const syncLeagueTeams = vi.hoisted(() => vi.fn());
vi.mock("./syncLeagueTeams.js", () => ({ syncLeagueTeams }));

import { selectedLeagues } from "../../config/selectedLeagues.js";
import { syncTeams } from "./syncTeams.js";

describe("syncTeams", () => {
  beforeEach(() => vi.clearAllMocks());

  it("syncs teams for every configured league ID", async () => {
    await syncTeams();

    expect(syncLeagueTeams).toHaveBeenCalledTimes(selectedLeagues.length);
    expect(syncLeagueTeams).toHaveBeenCalledWith(selectedLeagues[0].id);
  });
});
