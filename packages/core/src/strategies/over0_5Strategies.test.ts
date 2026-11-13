import { describe, expect, it } from "vitest";
import {
  matchesOver0_5StrategyVariation,
  over0_5StrategyVariations,
} from "./over0_5Strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("Over 0.5 strategies", () => {
  it.each(over0_5StrategyVariations)(
    "matches high scoring data for $id",
    (strategy) =>
      expect(
        matchesOver0_5StrategyVariation(strategySnapshot(), strategy),
      ).toBe(true),
  );
  it("enforces rate and five-game requirements", () => {
    const strategy = over0_5StrategyVariations.find(
      (item) => item.threshold === 60,
    )!;
    expect(
      matchesOver0_5StrategyVariation(
        strategySnapshot({ rates: { over0_5: 60 } }),
        strategy,
      ),
    ).toBe(true);
    expect(
      matchesOver0_5StrategyVariation(
        strategySnapshot({ rates: { over0_5: 40 } }),
        strategy,
      ),
    ).toBe(false);
    expect(
      matchesOver0_5StrategyVariation(
        strategySnapshot({ homePlayed: 4 }),
        strategy,
      ),
    ).toBe(false);
  });
});
