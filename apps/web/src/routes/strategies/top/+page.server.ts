import {
	bttnsStrategyVariations,
	getBettableMinimumOdds,
	getBettableOddsBandIds,
	bttsStrategyVariations,
	leagueRateStrategyVariations,
	over1_5StrategyVariations,
	over2_5RateStrategyVariations,
	under2_5StrategyVariations,
	under1_5StrategyVariations,
	over0_5StrategyVariations,
	teamFilterVariations,
	sumOddsBandPerformance
} from '@black-diamond/core/strategies';
import { getStrategyPerformanceSeasonTotals } from '@black-diamond/database/strategyPerformances';
import { minimumStrategyBetsForRanking } from '@black-diamond/core/strategies';

type StrategyDefinition = {
	id: string;
	title: string;
	description: string;
	market: 'Over 2.5 goals' | 'Under 2.5 goals' | 'Over 1.5 goals' | 'Under 1.5 goals' | 'Over 0.5 goals' | 'BTTS' | 'BTNTS';
	href: string;
};

const marketDetails = {
	over2_5: { market: 'Over 2.5 goals', href: '/strategies/over-2-5' },
	under2_5: { market: 'Under 2.5 goals', href: '/strategies/under-2-5' },
	under1_5: { market: 'Under 1.5 goals', href: '/strategies/under-1-5' },
	over0_5: { market: 'Over 0.5 goals', href: '/strategies/over-0-5' },
	over1_5: { market: 'Over 1.5 goals', href: '/strategies/over-1-5' },
	btts: { market: 'BTTS', href: '/strategies/btts' },
	bttns: { market: 'BTNTS', href: '/strategies/btnts' }
} as const;

const minimumBetsForRanking = minimumStrategyBetsForRanking;

function getMarketKey(market: StrategyDefinition['market']) {
	return market === 'Over 0.5 goals' ? 'over0_5' : market === 'Over 1.5 goals' ? 'over1_5' : market === 'Under 1.5 goals' ? 'under1_5' : market === 'Under 2.5 goals' ? 'under2_5' : market === 'BTTS' ? 'btts' : market === 'BTNTS' ? 'bttns' : 'over2_5';
}

const strategyDefinitions: StrategyDefinition[] = [
	...teamFilterVariations
		.filter((strategy) => strategy.sample === 'last5')
		.map((strategy) => ({ ...strategy, ...marketDetails.over2_5 })),
	...over2_5RateStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.over2_5 })),
	...under2_5StrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.under2_5 })),
	...under1_5StrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.under1_5 })),
	...over0_5StrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.over0_5 })),
	...over1_5StrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.over1_5 })),
	...bttsStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.btts })),
	...bttnsStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.bttns })),
	...leagueRateStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails[strategy.market] }))
];

export async function load() {
	const summaries = await getStrategyPerformanceSeasonTotals(strategyDefinitions.map((strategy) => strategy.id));
	const summariesById = new Map(summaries.map((summary) => [summary.strategyId, summary]));

	const strategies = strategyDefinitions
		.map((strategy) => {
			const marketKey = getMarketKey(strategy.market);
			const summary = summariesById.get(strategy.id);
			const oddsBandIds = getBettableOddsBandIds(marketKey);
			const performance = sumOddsBandPerformance(
				summary?.oddsBands,
				oddsBandIds,
				'all'
			);
			const bets = performance?.bets ?? 0;
			const profit = performance?.profit ?? 0;
			return {
				...strategy,
				minimumOdds: getBettableMinimumOdds(marketKey),
				bets,
				wins: performance?.wins ?? 0,
				losses: performance?.losses ?? 0,
				profit,
				returnOnInvestment: bets === 0 ? null : (profit / bets) * 100,
				leaguePerformances: (summary?.leaguePerformances ?? [])
					.map((league) => {
						const leagueTotals = league.bettablePerformance;
						const leagueBets = leagueTotals?.bets ?? 0;
						const leagueProfit = leagueTotals?.profit ?? 0;
						return {
							leagueId: league.leagueId,
							name: league.name,
							country: league.country,
							bets: leagueBets,
							wins: leagueTotals?.wins ?? 0,
							losses: leagueTotals?.losses ?? 0,
							profit: leagueProfit,
							returnOnInvestment: leagueBets === 0 ? null : (leagueProfit / leagueBets) * 100
						};
					})
					.filter((league) => league.bets > 0)
					.sort((left, right) => right.profit - left.profit)
			};
		})
		.filter((strategy) => strategy.bets >= minimumBetsForRanking && strategy.profit > 0)
		.sort(
			(left, right) =>
				(right.returnOnInvestment ?? Number.NEGATIVE_INFINITY) -
					(left.returnOnInvestment ?? Number.NEGATIVE_INFINITY) ||
				right.profit - left.profit
		)
		.slice(0, 10);

	return { strategies, minimumBetsForRanking };
}
