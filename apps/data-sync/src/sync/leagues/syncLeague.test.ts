import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), upsertLeague: vi.fn() }));

vi.mock("@black-diamond/database/leagues", () => ({ upsertLeague: mocks.upsertLeague }));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({
  getApiFootballClient: () => ({ get: mocks.get }),
}));

import { syncLeague } from "./syncLeague.js";

describe("syncLeague", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches and upserts the selected league", async () => {
    const league = { league: { id: 39 } };
    mocks.get.mockResolvedValue({ response: [league] });

    await expect(syncLeague({ id: 39, name: "Premier League", country: "England" })).resolves.toBe(league);

    expect(mocks.get).toHaveBeenCalledWith("/leagues", { id: 39 });
    expect(mocks.upsertLeague).toHaveBeenCalledWith(league);
  });
});
