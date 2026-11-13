import { describe, expect, it } from "vitest";
import { matchesUnder3_5StrategyVariation, under3_5StrategyVariations } from "./under3_5Strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Under 3.5 strategies", () => {
  it.each(under3_5StrategyVariations)("matches low scoring data for $id", (strategy) => expect(matchesUnder3_5StrategyVariation(strategySnapshot({ homeGoalsFor: 0, awayGoalsFor: 0, homeGoalsAgainst: 0, awayGoalsAgainst: 0 }), strategy)).toBe(true));
  it("rejects a rate below the configured boundary", () => {
    const strategy = under3_5StrategyVariations.find((item) => item.under3_5RateThreshold === 60)!;
    expect(matchesUnder3_5StrategyVariation(strategySnapshot({ rates: { under3_5: 59 } }), strategy)).toBe(false);
  });
});
