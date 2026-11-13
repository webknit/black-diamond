import { describe, expect, it } from "vitest";
import { matchesUnder2_5StrategyVariation, under2_5StrategyVariations } from "./under2_5Strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Under 2.5 strategies", () => {
  it.each(under2_5StrategyVariations)("matches low scoring data for $id", (strategy) => expect(matchesUnder2_5StrategyVariation(strategySnapshot({ homeGoalsFor: 0, awayGoalsFor: 0, homeGoalsAgainst: 0, awayGoalsAgainst: 0 }), strategy)).toBe(true));
  it("rejects a rate below the configured boundary", () => {
    const strategy = under2_5StrategyVariations.find((item) => item.under2_5RateThreshold === 60)!;
    expect(matchesUnder2_5StrategyVariation(strategySnapshot({ rates: { under2_5: 59 } }), strategy)).toBe(false);
  });
});
