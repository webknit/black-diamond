import { describe, expect, it } from "vitest";
import {
  bttsStrategyVariations,
  matchesBttsStrategyVariation,
} from "./bttsStrategies.js";
import type { FixtureStatsSnapshot } from "../types/fixtureStatsSnapshot.js";
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
  it("uses each team's relevant-venue form rather than overall last-five form", () => {
    const strategy = bttsStrategyVariations.find(
      (item) => item.bttsRateThreshold === 80,
    )!;
    const snapshot = strategySnapshot({ rates: { btts: 100 } }) as FixtureStatsSnapshot;
    snapshot.home.last5 = { ...snapshot.home.last5, btts: { percentage: 0, count: 0 } };
    snapshot.away.last5 = { ...snapshot.away.last5, btts: { percentage: 0, count: 0 } };
    expect(matchesBttsStrategyVariation(snapshot, strategy)).toBe(true);
  });
  it("keeps an overall-last-five BTTS strategy alongside the H/A version", () => {
    const strategy = bttsStrategyVariations.find(
      (item) => item.id === "btts-rate80-overall-last5",
    )!;
    const snapshot = strategySnapshot({ rates: { btts: 100 } }) as FixtureStatsSnapshot;
    snapshot.home.last5 = { ...snapshot.home.last5, btts: { percentage: 60, count: 3 } };
    expect(matchesBttsStrategyVariation(snapshot, strategy)).toBe(false);
  });
  it("requires five relevant-venue matches for BTTS-rate strategies", () => {
    const strategy = bttsStrategyVariations.find(
      (item) => item.bttsRateThreshold === 40,
    )!;
    expect(
      matchesBttsStrategyVariation(
        strategySnapshot({ homePlayed: 4, rates: { btts: 100 } }),
        strategy,
      ),
    ).toBe(false);
  });
});
