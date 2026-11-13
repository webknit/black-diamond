import { beforeEach, describe, expect, it, vi } from "vitest";

const syncLeague = vi.hoisted(() => vi.fn());
vi.mock("./syncLeague", () => ({ syncLeague }));

import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncSelectedLeagues } from "./syncSelectedLeagues";

describe("syncSelectedLeagues", () => {
  beforeEach(() => vi.clearAllMocks());

  it("syncs every configured league", async () => {
    await syncSelectedLeagues();

    expect(syncLeague).toHaveBeenCalledTimes(selectedLeagues.length);
    expect(syncLeague).toHaveBeenCalledWith(selectedLeagues[0]);
  });
});
