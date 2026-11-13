import { describe, expect, it } from "vitest";
import { matchesOver2_5RateStrategyVariation, over2_5RateStrategyVariations } from "./over2_5RateStrategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Over 2.5 rate strategies", () => {
  it.each(over2_5RateStrategyVariations)("accepts its rate boundary for $id", (strategy) => {
    expect(matchesOver2_5RateStrategyVariation(strategySnapshot({ rates: { over2_5: strategy.over2_5RateThreshold } }), strategy)).toBe(true);
    expect(matchesOver2_5RateStrategyVariation(strategySnapshot({ rates: { over2_5: strategy.over2_5RateThreshold - 1 } }), strategy)).toBe(false);
  });

  it("rejects a venue-rate variation when its stored venue sample is unavailable", () => {
    const strategy = over2_5RateStrategyVariations.find((item) => item.rateSample === "last3Venue")!;
    const snapshot = strategySnapshot({ rates: { over2_5: strategy.over2_5RateThreshold } }) as { home: { last3Venue?: unknown } };
    delete snapshot.home.last3Venue;
    expect(matchesOver2_5RateStrategyVariation(snapshot as never, strategy)).toBe(false);
  });
});
