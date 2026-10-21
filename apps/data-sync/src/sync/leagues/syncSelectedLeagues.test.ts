import { beforeEach, describe, expect, it, vi } from "vitest";

const syncLeague = vi.hoisted(() => vi.fn());
vi.mock("./syncLeague.js", () => ({ syncLeague }));

import { selectedLeagues } from "../../config/selectedLeagues.js";
import { syncSelectedLeagues } from "./syncSelectedLeagues.js";

describe("syncSelectedLeagues", () => {
  beforeEach(() => vi.clearAllMocks());

  it("syncs every configured league", async () => {
    await syncSelectedLeagues();

    expect(syncLeague).toHaveBeenCalledTimes(selectedLeagues.length);
    expect(syncLeague).toHaveBeenCalledWith(selectedLeagues[0]);
  });
});
