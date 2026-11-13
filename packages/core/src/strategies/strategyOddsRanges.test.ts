import { describe, expect, it } from "vitest";
import {
  getStrategyOddsRangeIds,
  over0_5OddsRanges,
  over1_5OddsRanges,
  over2_5OddsRanges,
  over3_5OddsRanges,
  strategyOddsRanges,
  under1_5OddsRanges,
  under3_5OddsRanges,
} from "./strategyOddsRanges.js";

describe("strategy odds ranges", () => {
  it("assigns boundaries to the correct stored ranges", () => {
    expect(getStrategyOddsRangeIds(1)).toEqual([]);
    expect(getStrategyOddsRangeIds(1.08)).toEqual(["1.08-1.10", "1-1.69"]);
    expect(getStrategyOddsRangeIds(1.7)).toEqual(["1.60+", "1.70-1.99"]);
    expect(getStrategyOddsRangeIds(2.2)).toEqual(["1.60+", "2.00-2.49", "2.20-2.49"]);
    expect(getStrategyOddsRangeIds(3)).toEqual(["1.60+", "3.00+"]);
    expect(getStrategyOddsRangeIds(Number.NaN)).toEqual([]);
  });

  it("exports the intended display groups", () => {
    expect(over0_5OddsRanges.at(-1)?.bandIds).toEqual(["1.20-1.29", "1.30-1.39", "1.40-1.59", "1.60+"]);
    expect(over1_5OddsRanges.map((range) => range.id)).toEqual(["1.20-1.29", "1.30-1.39", "1.40-1.59", "1.60+"]);
    expect(under3_5OddsRanges.map((range) => range.id)).toEqual(["1.30-1.39", "1.40-1.59", "1.60+"]);
    expect(over3_5OddsRanges.map((range) => range.id)).toEqual(["2.20-2.49", "2.50-2.99", "3.00+"]);
    expect(over2_5OddsRanges.map((range) => range.id)).toEqual(["1-1.69", "1.70-1.99", "2.00-2.49", "2.20-2.49", "2.50-2.99", "3.00+"]);
    expect(under1_5OddsRanges.map((range) => range.id)).toEqual(["2.50-2.99", "3.00+"]);
    expect(strategyOddsRanges).toHaveLength(14);
  });
});
