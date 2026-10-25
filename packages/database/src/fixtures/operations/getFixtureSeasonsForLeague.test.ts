import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  distinct: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getFixtureSeasonsForLeague } from "./getFixtureSeasonsForLeague.js";

describe("getFixtureSeasonsForLeague", () => {
  it("returns the stored seasons in chronological order", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ distinct: mocks.distinct });
    mocks.distinct.mockResolvedValue([2026, 2024, 2025]);

    await expect(getFixtureSeasonsForLeague(39)).resolves.toEqual([2024, 2025, 2026]);
    expect(mocks.distinct).toHaveBeenCalledWith("league.season", { "league.id": 39 });
  });
});
