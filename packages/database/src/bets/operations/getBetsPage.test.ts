import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  countDocuments: vi.fn(),
  find: vi.fn(),
  sort: vi.fn(),
  skip: vi.fn(),
  limit: vi.fn(),
  toArray: vi.fn(),
  findOne: vi.fn(),
  aggregate: vi.fn(),
  aggregateToArray: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ getDatabase: vi.fn(async () => ({ collection: mocks.collection })) }));

import {
  getBetByIdAndAccountId,
  getBetPeriodSummary,
  getBetsPage,
} from "./getBetsByAccountId.js";

describe("getBetsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.collection.mockReturnValue({
      countDocuments: mocks.countDocuments,
      find: mocks.find,
      findOne: mocks.findOne,
      aggregate: mocks.aggregate,
    });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ skip: mocks.skip });
    mocks.skip.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockReturnValue({ toArray: mocks.toArray });
    mocks.countDocuments.mockResolvedValue(61);
    mocks.toArray.mockResolvedValue([]);
    mocks.aggregate.mockReturnValue({ toArray: mocks.aggregateToArray });
    mocks.aggregateToArray.mockResolvedValue([]);
  });

  it("fetches a bounded page with date filtering and newest-first stable ordering", async () => {
    await expect(
      getBetsPage("main", 2, 25, {
        from: "2026-10-19T00:00:00.000Z",
        to: "2026-10-26T00:00:00.000Z",
      }),
    ).resolves.toEqual({ items: [], totalCount: 61, page: 2 });

    expect(mocks.countDocuments).toHaveBeenCalledWith({
      accountId: "main",
      placedAt: { $gte: "2026-10-19T00:00:00.000Z", $lt: "2026-10-26T00:00:00.000Z" },
    });
    expect(mocks.find).toHaveBeenCalledWith(
      {
        accountId: "main",
        placedAt: { $gte: "2026-10-19T00:00:00.000Z", $lt: "2026-10-26T00:00:00.000Z" },
      },
      { projection: { _id: 0 } },
    );
    expect(mocks.sort).toHaveBeenCalledWith({ placedAt: -1, id: -1 });
    expect(mocks.skip).toHaveBeenCalledWith(25);
    expect(mocks.limit).toHaveBeenCalledWith(25);
  });

  it("clamps page number after rows have been deleted", async () => {
    mocks.countDocuments.mockResolvedValue(26);

    await expect(getBetsPage("main", 5, 25)).resolves.toEqual({
      items: [],
      totalCount: 26,
      page: 2,
    });
    expect(mocks.skip).toHaveBeenCalledWith(25);
  });

  it("looks up a bet only within its owning account", async () => {
    mocks.findOne.mockResolvedValue(null);

    await expect(getBetByIdAndAccountId("bet-1", "main")).resolves.toBeNull();

    expect(mocks.findOne).toHaveBeenCalledWith(
      { id: "bet-1", accountId: "main" },
      { projection: { _id: 0 } },
    );
  });

  it("aggregates totals across the full selected period, not only one page", async () => {
    const summary = {
      betCount: 30,
      totalStake: 300,
      totalReturned: 420,
      settledProfitLoss: 95,
      settledBetCount: 24,
      averageOdds: 2.15,
    };
    mocks.aggregateToArray.mockResolvedValue([summary]);

    await expect(
      getBetPeriodSummary("main", {
        from: "2026-10-01T00:00:00.000Z",
        to: "2026-11-01T00:00:00.000Z",
      }),
    ).resolves.toEqual(summary);

    const pipeline = mocks.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({
      $match: {
        accountId: "main",
        placedAt: { $gte: "2026-10-01T00:00:00.000Z", $lt: "2026-11-01T00:00:00.000Z" },
      },
    });
    expect(pipeline[1].$group).toMatchObject({
      betCount: { $sum: 1 },
      totalStake: { $sum: "$stake" },
      totalReturned: { $sum: { $ifNull: ["$returnAmount", 0] } },
      averageOdds: { $avg: "$placedOdds" },
    });
  });

  it("returns empty totals when no bets match the period", async () => {
    await expect(getBetPeriodSummary("main")).resolves.toEqual({
      betCount: 0,
      totalStake: 0,
      totalReturned: 0,
      settledProfitLoss: 0,
      settledBetCount: 0,
      averageOdds: null,
    });
  });
});
