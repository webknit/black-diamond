import { afterEach, describe, expect, it, vi } from "vitest";
import { logSyncStep } from "./logSyncStep.js";

describe("logSyncStep", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs a sync step when it starts and finishes", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await expect(logSyncStep("fixture sync", async () => 42)).resolves.toBe(42);

    expect(info).toHaveBeenNthCalledWith(1, "[data-sync] Starting: fixture sync");
    expect(info).toHaveBeenNthCalledWith(2, expect.stringMatching(/^\[data-sync\] Finished: fixture sync \(\d+\.\d+s\)$/));
  });

  it("logs and rethrows sync failures", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("sync failed");

    await expect(logSyncStep("fixture sync", async () => {
      throw error;
    })).rejects.toBe(error);

    expect(errorLog).toHaveBeenCalledWith(
      expect.stringMatching(/^\[data-sync\] Failed: fixture sync \(\d+\.\d+s\)$/),
      error,
    );
  });
});
