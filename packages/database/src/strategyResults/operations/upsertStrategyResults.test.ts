import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bulkWrite: vi.fn(),
  collection: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { upsertStrategyResults } from "./upsertStrategyResults.js";

describe("upsertStrategyResults", () => {
  it("upserts results by fixture, strategy, and version", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ bulkWrite: mocks.bulkWrite });
    const result = {
      fixtureId: 10,
      leagueId: 39,
      season: 2026,
      fixtureTimestamp: 1,
      strategyId: "bothTeamsAboveLeagueAverage",
      strategyVersion: 1,
      referenceOdd: 1.8,
      eligible: true,
      result: "won" as const,
      profit: 0.8,
      evaluatedAt: "2026-10-26T00:00:00.000Z",
    };

    await upsertStrategyResults([result]);

    expect(mocks.bulkWrite).toHaveBeenCalledWith([
      {
        updateOne: {
          filter: { fixtureId: 10, strategyId: "bothTeamsAboveLeagueAverage", strategyVersion: 1 },
          update: { $set: result },
          upsert: true,
        },
      },
    ]);
  });

  it("does not connect when there is nothing to write", async () => {
    await upsertStrategyResults([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
