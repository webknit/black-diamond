import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  sort: vi.fn(),
  toArray: vi.fn(),
  skip: vi.fn(),
  limit: vi.fn(),
  countDocuments: vi.fn(),
}));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import {
  getBalanceHistoryByAccountId,
  getBalanceTransactionsByAccountId,
  getBalanceTransactionsPage,
} from "./getBalanceTransactionsByAccountId.js";

describe("getBalanceTransactionsByAccountId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find, countDocuments: mocks.countDocuments });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({
      skip: mocks.skip,
      limit: mocks.limit,
      toArray: mocks.toArray,
    });
    mocks.skip.mockReturnValue({ limit: mocks.limit, toArray: mocks.toArray });
    mocks.limit.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([]);
  });

  it("returns account transactions in chronological order", async () => {
    await expect(getBalanceTransactionsByAccountId("main")).resolves.toEqual([]);

    expect(mocks.find).toHaveBeenCalledWith(
      { accountId: "main" },
      { projection: { _id: 0 } },
    );
    expect(mocks.sort).toHaveBeenCalledWith({ occurredAt: 1, id: 1 });
  });

  it("returns a bounded page in newest-first order", async () => {
    mocks.countDocuments.mockResolvedValue(61);

    await expect(getBalanceTransactionsPage("main", 2, 25)).resolves.toEqual({
      items: [],
      totalCount: 61,
      page: 2,
    });

    expect(mocks.find).toHaveBeenCalledWith(
      { accountId: "main" },
      { projection: { _id: 0 } },
    );
    expect(mocks.sort).toHaveBeenCalledWith({ occurredAt: -1, id: -1 });
    expect(mocks.skip).toHaveBeenCalledWith(25);
    expect(mocks.limit).toHaveBeenCalledWith(25);
  });

  it("clamps a stale page number to the final available page", async () => {
    mocks.countDocuments.mockResolvedValue(26);

    await expect(getBalanceTransactionsPage("main", 5, 25)).resolves.toEqual({
      items: [],
      totalCount: 26,
      page: 2,
    });
    expect(mocks.skip).toHaveBeenCalledWith(25);
  });

  it("loads only the latest transaction before the graph window and the window itself", async () => {
    const cursor = { sort: mocks.sort, limit: mocks.limit, toArray: mocks.toArray };
    mocks.find.mockReturnValue(cursor);
    mocks.sort.mockReturnValue(cursor);
    mocks.limit.mockReturnValue(cursor);

    await getBalanceHistoryByAccountId("main", "2026-01-01T00:00:00.000Z");

    expect(mocks.find).toHaveBeenNthCalledWith(
      1,
      { accountId: "main", occurredAt: { $lt: "2026-01-01T00:00:00.000Z" } },
      { projection: { _id: 0 } },
    );
    expect(mocks.limit).toHaveBeenCalledWith(1);
    expect(mocks.find).toHaveBeenNthCalledWith(
      2,
      { accountId: "main", occurredAt: { $gte: "2026-01-01T00:00:00.000Z" } },
      { projection: { _id: 0 } },
    );
  });
});
