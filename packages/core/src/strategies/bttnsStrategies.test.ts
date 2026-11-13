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
});
