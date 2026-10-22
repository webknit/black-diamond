type RateLimiterOptions = {
  minimumIntervalMs: number;
  now?: () => number;
  sleep?: (milliseconds: number) => Promise<void>;
};

export function createRateLimiter({
  minimumIntervalMs,
  now = Date.now,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}: RateLimiterOptions) {
  let nextRequestAt = 0;

  async function waitForTurn(): Promise<void> {
    const currentTime = now();
    const scheduledTime = Math.max(currentTime, nextRequestAt);
    nextRequestAt = scheduledTime + minimumIntervalMs;

    const waitMilliseconds = scheduledTime - currentTime;
    if (waitMilliseconds > 0) await sleep(waitMilliseconds);
  }

  return { waitForTurn };
}
