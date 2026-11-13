import { describe, expect, it } from "vitest";
import { matchesOver3_5StrategyVariation, over3_5StrategyVariations } from "./over3_5Strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Over 3.5 strategies", () => {
  it.each(over3_5StrategyVariations)("matches high scoring data for $id", (strategy) => expect(matchesOver3_5StrategyVariation(strategySnapshot(), strategy)).toBe(true));
  it("rejects a rate below the configured boundary", () => {
    const strategy = over3_5StrategyVariations.find((item) => item.over3_5RateThreshold === 60)!;
    expect(matchesOver3_5StrategyVariation(strategySnapshot({ rates: { over3_5: 59 } }), strategy)).toBe(false);
  });
});
