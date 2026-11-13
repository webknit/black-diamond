import { describe, expect, it } from "vitest";
import { matchesUnder1_5StrategyVariation, under1_5StrategyVariations } from "./under1_5Strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Under 1.5 strategies", () => {
  it.each(under1_5StrategyVariations)("matches low scoring data for $id", (strategy) => expect(matchesUnder1_5StrategyVariation(strategySnapshot({ homeGoalsFor: 0, awayGoalsFor: 0, homeGoalsAgainst: 0, awayGoalsAgainst: 0 }), strategy)).toBe(true));
  it("rejects a rate below the configured boundary", () => {
    const strategy = under1_5StrategyVariations.find((item) => item.under1_5RateThreshold === 60)!;
    expect(matchesUnder1_5StrategyVariation(strategySnapshot({ rates: { under1_5: 59 } }), strategy)).toBe(false);
  });
});
