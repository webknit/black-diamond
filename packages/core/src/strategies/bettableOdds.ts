import type { BotdMarket } from "./botdStrategies.js";
import type { StrategyPerformanceTotals } from "../types/strategyPerformance.js";

export const bettableMinimumOdds = {
  over2_5: 1.7,
  under2_5: 1.7,
  btts: 1.7,
  bttns: 1.7,
  over1_5: 1.2,
  under1_5: 3,
  over0_5: 1.08,
} as const;

export type BettableOddsMarket = keyof typeof bettableMinimumOdds;

export function getBettableMinimumOdds(market: BettableOddsMarket): number {
  return bettableMinimumOdds[market];
}

/** The non-overlapping stored bands that make up each market's odds floor. */
export function getBettableOddsBandIds(
  market: BotdMarket | "over0_5",
): string[] {
  return market === "over0_5"
    ? ["1.08-1.10", "1.11-1.15", "1.16-1.19", "1.20-1.39", "1.40-1.59", "1.60+"]
    : market === "over1_5"
    ? ["1.20-1.39", "1.40-1.59", "1.60+"]
    : market === "under1_5"
    ? ["3.00+"]
    : ["1.70-1.99", "2.00-2.49", "2.50-2.99", "3.00+"];
}

export function sumOddsBandPerformance(
  oddsBands: Record<string, { seasonPerformance: StrategyPerformanceTotals; weeks?: Record<string, StrategyPerformanceTotals> }> | undefined,
  bandIds: readonly string[],
  week: string | "all",
): StrategyPerformanceTotals {
  return bandIds.reduce(
    (total, bandId) => {
      const performance = oddsBands?.[bandId];
      const value = week === "all" ? performance?.seasonPerformance : performance?.weeks?.[week];
      return {
        bets: total.bets + (value?.bets ?? 0),
        wins: total.wins + (value?.wins ?? 0),
        losses: total.losses + (value?.losses ?? 0),
        profit: total.profit + (value?.profit ?? 0),
      };
    },
    { bets: 0, wins: 0, losses: 0, profit: 0 },
  );
}
