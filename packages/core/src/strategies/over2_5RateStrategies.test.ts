import { describe, expect, it } from "vitest";
import { matchesOver2_5RateStrategyVariation, over2_5RateStrategyVariations } from "./over2_5RateStrategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Over 2.5 rate strategies", () => {
  it.each(over2_5RateStrategyVariations)("accepts its rate boundary for $id", (strategy) => {
    expect(matchesOver2_5RateStrategyVariation(strategySnapshot({ rates: { over2_5: strategy.over2_5RateThreshold } }), strategy)).toBe(true);
    expect(matchesOver2_5RateStrategyVariation(strategySnapshot({ rates: { over2_5: strategy.over2_5RateThreshold - 1 } }), strategy)).toBe(false);
  });
});
