import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rateLimiter.js";

describe("createRateLimiter", () => {
  it("spaces requests by the configured minimum interval", async () => {
    let currentTime = 0;
    const sleep = vi.fn(async (milliseconds: number) => {
      currentTime += milliseconds;
    });
    const limiter = createRateLimiter({
      minimumIntervalMs: 1000 / 6,
      now: () => currentTime,
      sleep,
    });

    await limiter.waitForTurn();
    await limiter.waitForTurn();
    await limiter.waitForTurn();

    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep.mock.calls[0][0]).toBeCloseTo(1000 / 6);
    expect(sleep.mock.calls[1][0]).toBeCloseTo(1000 / 6);
  });
});
