import {
  bttnsStrategyVariations,
  getBettableMinimumOdds,
  getBettableOddsBandIds,
  bttsStrategyVariations,
  leagueRateStrategyVariations,
  over0_5StrategyVariations,
  over1_5StrategyVariations,
  over2_5RateStrategyVariations,
	over3_5StrategyVariations,
  sumOddsBandPerformance,
  teamFilterVariations,
  under1_5StrategyVariations,
  under2_5StrategyVariations,
	under3_5StrategyVariations,
} from "@black-diamond/core/strategies";
import { getStrategyPerformanceSeasonTotals } from "@black-diamond/database/strategyPerformances";

const minimumLeagueBets = 20;

type MarketKey =
  | "over2_5"
	| "over3_5"
  | "under2_5"
	| "under3_5"
  | "over1_5"
  | "under1_5"
  | "over0_5"
  | "btts"
  | "bttns";
type StrategyDefinition = {
  id: string;
  title: string;
  market: string;
  marketKey: MarketKey;
  href: string;
};

const marketDetails: Record<
  MarketKey,
  Pick<StrategyDefinition, "market" | "href">
> = {
  over2_5: { market: "Over 2.5 goals", href: "/strategies/over-2-5" },
	over3_5: { market: "Over 3.5 goals", href: "/strategies/over-3-5" },
  under2_5: { market: "Under 2.5 goals", href: "/strategies/under-2-5" },
	under3_5: { market: "Under 3.5 goals", href: "/strategies/under-3-5" },
  over1_5: { market: "Over 1.5 goals", href: "/strategies/over-1-5" },
  under1_5: { market: "Under 1.5 goals", href: "/strategies/under-1-5" },
  over0_5: { market: "Over 0.5 goals", href: "/strategies/over-0-5" },
  btts: { market: "BTTS", href: "/strategies/btts" },
  bttns: { market: "BTNTS", href: "/strategies/btnts" },
};

function withMarket<T extends { id: string; title: string }>(
  strategies: readonly T[],
  marketKey: MarketKey,
): StrategyDefinition[] {
  return strategies.map((strategy) => ({
    ...strategy,
    ...marketDetails[marketKey],
    marketKey,
  }));
}

const strategyDefinitions: StrategyDefinition[] = [
  ...withMarket(
    teamFilterVariations.filter((strategy) => strategy.sample === "last5"),
    "over2_5",
  ),
  ...withMarket(over2_5RateStrategyVariations, "over2_5"),
	...withMarket(over3_5StrategyVariations, "over3_5"),
  ...withMarket(under2_5StrategyVariations, "under2_5"),
	...withMarket(under3_5StrategyVariations, "under3_5"),
  ...withMarket(under1_5StrategyVariations, "under1_5"),
  ...withMarket(over0_5StrategyVariations, "over0_5"),
  ...withMarket(over1_5StrategyVariations, "over1_5"),
  ...withMarket(bttsStrategyVariations, "btts"),
  ...withMarket(bttnsStrategyVariations, "bttns"),
  ...leagueRateStrategyVariations.map((strategy) => ({
    ...strategy,
    ...marketDetails[strategy.market],
    marketKey: strategy.market,
  })),
];

export async function load() {
  const summaries = await getStrategyPerformanceSeasonTotals(
    strategyDefinitions.map((strategy) => strategy.id),
  );
  const summariesById = new Map(
    summaries.map((summary) => [summary.strategyId, summary]),
  );
  const results = strategyDefinitions
    .flatMap((strategy) => {
      return (summariesById.get(strategy.id)?.leaguePerformances ?? []).map(
        (league) => {
          const totals = league.bettablePerformance;
          const bets = totals?.bets ?? 0;
          const profit = totals?.profit ?? 0;
          return {
            ...strategy,
            leagueId: league.leagueId,
            leagueName: league.name,
            country: league.country,
            minimumOdds: getBettableMinimumOdds(strategy.marketKey),
            bets,
            wins: totals?.wins ?? 0,
            losses: totals?.losses ?? 0,
            profit,
            returnOnInvestment: bets === 0 ? null : (profit / bets) * 100,
          };
        },
      );
    })
    .filter((result) => result.bets >= minimumLeagueBets && result.profit > 0)
    .sort(
      (left, right) =>
        (right.returnOnInvestment ?? Number.NEGATIVE_INFINITY) -
          (left.returnOnInvestment ?? Number.NEGATIVE_INFINITY) ||
        right.profit - left.profit,
    );

  const marketMinimumOdds = [
    { label: "Over/Under 2.5, BTTS & BTNTS", minimumOdds: getBettableMinimumOdds("over2_5") },
		{ label: "Over 3.5", minimumOdds: getBettableMinimumOdds("over3_5") },
    { label: "Over 1.5", minimumOdds: getBettableMinimumOdds("over1_5") },
    { label: "Over 0.5", minimumOdds: getBettableMinimumOdds("over0_5") },
		{ label: "Under 3.5", minimumOdds: getBettableMinimumOdds("under3_5") },
    { label: "Under 1.5", minimumOdds: getBettableMinimumOdds("under1_5") },
  ];

  return { results, minimumLeagueBets, marketMinimumOdds };
}
