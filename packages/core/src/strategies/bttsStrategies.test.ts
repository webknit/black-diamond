import { describe, expect, it } from "vitest";
import {
  bttsStrategyVariations,
  matchesBttsStrategyVariation,
} from "./bttsStrategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("BTTS strategies", () => {
  it.each(bttsStrategyVariations)(
    "matches high scoring data for $id",
    (strategy) =>
      expect(matchesBttsStrategyVariation(strategySnapshot(), strategy)).toBe(
        true,
      ),
  );
  it("rejects a rate below its threshold", () => {
    const strategy = bttsStrategyVariations.find(
      (item) => item.bttsRateThreshold === 60,
    )!;
    expect(
      matchesBttsStrategyVariation(
        strategySnapshot({ rates: { btts: 59 } }),
        strategy,
      ),
    ).toBe(false);
  });
});
