import { describe, expect, it } from "vitest";
import { matchesOver1_5StrategyVariation, over1_5StrategyVariations } from "./over1_5Strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Over 1.5 strategies", () => {
  it.each(over1_5StrategyVariations)("matches high scoring data for $id", (strategy) => expect(matchesOver1_5StrategyVariation(strategySnapshot(), strategy)).toBe(true));
  it("enforces rate and five-game requirements", () => {
    const strategy = over1_5StrategyVariations.find((item) => item.over1_5RateThreshold === 60)!;
    expect(matchesOver1_5StrategyVariation(strategySnapshot({ rates: { over1_5: 40 } }), strategy)).toBe(false);
    expect(matchesOver1_5StrategyVariation(strategySnapshot({ homePlayed: 4 }), strategy)).toBe(false);
  });
});
