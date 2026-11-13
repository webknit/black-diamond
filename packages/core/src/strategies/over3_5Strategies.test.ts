import { describe, expect, it } from "vitest";
import { matchesOver3_5StrategyVariation, over3_5StrategyVariations } from "./over3_5Strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Over 3.5 strategies", () => {
  it("defines the base, rate, reciprocal, and dominant-attack variants", () => {
    expect(over3_5StrategyVariations).toHaveLength(58);
    expect(over3_5StrategyVariations.map((strategy) => strategy.title)).not.toContain(expect.stringContaining("score >= 0.9"));
  });

  it.each(over3_5StrategyVariations)("matches high scoring data for $id", (strategy) => expect(matchesOver3_5StrategyVariation(strategySnapshot(), strategy)).toBe(true));
  it("rejects a rate below the configured boundary", () => {
    const strategy = over3_5StrategyVariations.find((item) => item.over3_5RateThreshold === 60)!;
    expect(matchesOver3_5StrategyVariation(strategySnapshot({ rates: { over3_5: 59 } }), strategy)).toBe(false);
  });

  it("requires both teams to be defensively open and involved in high-total matches", () => {
    const strategy = over3_5StrategyVariations.find((item) => item.id === "over3_5-score1.5-bothTeams-concede1.25-total2.5")!;
    expect(matchesOver3_5StrategyVariation(strategySnapshot({ homeGoalsFor: 2, awayGoalsFor: 2, homeGoalsAgainst: 1, awayGoalsAgainst: 2 }), strategy)).toBe(false);
    expect(matchesOver3_5StrategyVariation(strategySnapshot({ homeGoalsFor: 2, awayGoalsFor: 1.5, homeGoalsAgainst: 1.5, awayGoalsAgainst: 1.5 }), strategy)).toBe(true);
  });

  it("allows a dominant attack without requiring the opponent to score heavily", () => {
    const strategy = over3_5StrategyVariations.find((item) => item.id === "over3_5-score2-atLeastOneTeam-concede1.25-total2.5")!;
    expect(matchesOver3_5StrategyVariation(strategySnapshot({ homeGoalsFor: 2.5, awayGoalsFor: 0.5, homeGoalsAgainst: 1.5, awayGoalsAgainst: 2.5 }), strategy)).toBe(true);
  });
});
