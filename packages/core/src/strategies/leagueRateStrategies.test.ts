import { describe, expect, it } from "vitest";
import { leagueRateStrategyVariations, matchesLeagueRateStrategyVariation } from "./leagueRateStrategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";

describe("league rate strategies", () => {
  it.each(leagueRateStrategyVariations)("matches qualifying league and team data for $id", (strategy) => {
    const low = strategy.market === "bttns";
    const league = {
      fixturesPlayed: 5,
      over1_5Percentage: low ? 100 : 100,
      over2_5Percentage: low ? 100 : 100,
      bttsPercentage: low ? strategy.leagueThreshold : 100,
    };
    expect(matchesLeagueRateStrategyVariation(
      strategySnapshot(low ? { homeGoalsFor: 0, awayGoalsFor: 0, homeGoalsAgainst: 0, awayGoalsAgainst: 0 } : {}),
      league,
      strategy,
    )).toBe(true);
  });

  it("rejects insufficient league history", () => {
    const strategy = leagueRateStrategyVariations[0];
    expect(matchesLeagueRateStrategyVariation(strategySnapshot(), {
      fixturesPlayed: 4, over1_5Percentage: 100, over2_5Percentage: 100, bttsPercentage: 100,
    }, strategy)).toBe(false);
  });
});
