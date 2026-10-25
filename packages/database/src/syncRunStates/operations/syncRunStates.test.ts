import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  findOne: vi.fn(),
  getDatabase: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { getSyncRunState } from "./getSyncRunState.js";
import { markSyncRunCompleted } from "./markSyncRunCompleted.js";
import { markSyncRunFailed } from "./markSyncRunFailed.js";
import { markSyncRunStarted } from "./markSyncRunStarted.js";

describe("sync run states", () => {
  const now = new Date("2026-10-25T12:00:00Z");

  function mockDatabase() {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({
      findOne: mocks.findOne,
      updateOne: mocks.updateOne,
    });
  }

  it("reads the state for one scheduled sync", async () => {
    mockDatabase();
    mocks.findOne.mockResolvedValue({ run: "daily", lastStartedAt: now });

    await expect(getSyncRunState("daily")).resolves.toEqual({
      run: "daily",
      lastStartedAt: now,
    });
    expect(mocks.findOne).toHaveBeenCalledWith({ run: "daily" });
  });

  it("records start, completion, and failure without replacing a prior completion", async () => {
    mockDatabase();

    await markSyncRunStarted("daily", now);
    await markSyncRunCompleted("daily", now);
    await markSyncRunFailed("daily", new Error("Timed out"), now);

    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      1,
      { run: "daily" },
      { $set: { run: "daily", lastStartedAt: now } },
      { upsert: true },
    );
    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      2,
      { run: "daily" },
      { $set: { run: "daily", lastCompletedAt: now, lastError: null } },
      { upsert: true },
    );
    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      3,
      { run: "daily" },
      {
        $set: {
          run: "daily",
          lastFailedAt: now,
          lastError: "Timed out",
        },
      },
      { upsert: true },
    );
  });
});
