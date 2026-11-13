import { describe, expect, it } from "vitest";
import {
  bettableMinimumOdds,
  getBettableMinimumOdds,
  getBettableOddsBandIds,
  sumOddsBandPerformance,
} from "./bettableOdds.js";

describe("bettable odds", () => {
  it.each(Object.entries(bettableMinimumOdds))(
    "returns the configured minimum odds for %s",
    (market, minimumOdds) => {
      expect(
        getBettableMinimumOdds(market as keyof typeof bettableMinimumOdds),
      ).toBe(minimumOdds);
    },
  );

  it.each([
    ["over0_5", ["1.08-1.10", "1.11-1.15", "1.16-1.19", "1.20-1.29", "1.30-1.39", "1.40-1.59", "1.60+"]],
    ["over1_5", ["1.20-1.29", "1.30-1.39", "1.40-1.59", "1.60+"]],
    ["under3_5", ["1.30-1.39", "1.40-1.59", "1.60+"]],
    ["over3_5", ["2.20-2.49", "2.50-2.99", "3.00+"]],
    ["under1_5", ["3.00+"]],
    ["over2_5", ["1.70-1.99", "2.00-2.49", "2.50-2.99", "3.00+"]],
    ["under2_5", ["1.70-1.99", "2.00-2.49", "2.50-2.99", "3.00+"]],
    ["btts", ["1.70-1.99", "2.00-2.49", "2.50-2.99", "3.00+"]],
    ["bttns", ["1.70-1.99", "2.00-2.49", "2.50-2.99", "3.00+"]],
  ] as const)("returns every bettable band for %s", (market, bandIds) => {
    expect(getBettableOddsBandIds(market)).toEqual(bandIds);
  });

  it("returns zero totals when there are no odds bands", () => {
    expect(sumOddsBandPerformance(undefined, ["missing"], "all")).toEqual({
      bets: 0,
      wins: 0,
      losses: 0,
      profit: 0,
    });
  });

  it("sums selected season and week bands without counting missing bands", () => {
    const bands = {
      a: {
        seasonPerformance: { bets: 2, wins: 1, losses: 1, profit: 0.5 },
        weeks: { "2026-01-05": { bets: 1, wins: 1, losses: 0, profit: 1 } },
      },
      b: { seasonPerformance: { bets: 3, wins: 2, losses: 1, profit: 2 } },
    };

    expect(sumOddsBandPerformance(bands, ["a", "b", "missing"], "all")).toEqual({
      bets: 5,
      wins: 3,
      losses: 2,
      profit: 2.5,
    });
    expect(sumOddsBandPerformance(bands, ["a", "b"], "2026-01-05")).toEqual({
      bets: 1,
      wins: 1,
      losses: 0,
      profit: 1,
    });
    expect(sumOddsBandPerformance(bands, ["a", "b"], "2026-01-12")).toEqual({
      bets: 0,
      wins: 0,
      losses: 0,
      profit: 0,
    });
  });
});
