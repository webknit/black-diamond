import { describe, expect, it } from "vitest";
import {
  bttnsStrategyVariations,
  matchesBttnsStrategyVariation,
} from "./bttnsStrategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("BTNTS strategies", () => {
  it.each(bttnsStrategyVariations)(
    "matches low scoring data for $id",
    (strategy) =>
      expect(
        matchesBttnsStrategyVariation(
          strategySnapshot({
            homeGoalsFor: 0,
            awayGoalsFor: 0,
            homeGoalsAgainst: 0,
            awayGoalsAgainst: 0,
            rates: { btts: 0 },
          }),
          strategy,
        ),
      ).toBe(true),
  );
  it("requires five-match samples", () =>
    expect(
      matchesBttnsStrategyVariation(
        strategySnapshot({ homePlayed: 4, rates: { btts: 0 } }),
        bttnsStrategyVariations[0],
      ),
    ).toBe(false));
  it("keeps an overall-last-five BTNTS rate strategy alongside the H/A version", () => {
    const strategy = bttnsStrategyVariations.find(
      (item) => item.id === "bttns-btts20-overall-last5",
    )!;
    const snapshot = strategySnapshot({ rates: { btts: 0 } }) as never as {
      home: { last5: { btts: { percentage: number; count: number }; played: number } };
      away: { last5: { btts: { percentage: number; count: number }; played: number } };
    };
    snapshot.home.last5.btts.percentage = 60;
    snapshot.away.last5.btts.percentage = 60;
    expect(matchesBttnsStrategyVariation(snapshot as never, strategy)).toBe(false);
  });
});
