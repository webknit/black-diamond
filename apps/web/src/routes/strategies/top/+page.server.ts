import {
	bttnsStrategyVariations,
	bttsStrategyVariations,
	leagueRateStrategyVariations,
	over1_5StrategyVariations,
	over2_5RateStrategyVariations,
	teamFilterVariations
} from '@black-diamond/core/strategies';
import { getStrategyPerformanceSeasonTotals } from '@black-diamond/database/strategyPerformances';

type StrategyDefinition = {
	id: string;
	title: string;
	description: string;
	market: 'Over 2.5 goals' | 'Over 1.5 goals' | 'BTTS' | 'BTNTS';
	href: string;
};

const marketDetails = {
	over2_5: { market: 'Over 2.5 goals', href: '/strategies/over-2-5' },
	over1_5: { market: 'Over 1.5 goals', href: '/strategies/over-1-5' },
	btts: { market: 'BTTS', href: '/strategies/btts' },
	bttns: { market: 'BTNTS', href: '/strategies/btnts' }
} as const;

const minimumBetsForRanking = 50;

const strategyDefinitions: StrategyDefinition[] = [
	...teamFilterVariations.map((strategy) => ({ ...strategy, ...marketDetails.over2_5 })),
	...over2_5RateStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.over2_5 })),
	...over1_5StrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.over1_5 })),
	...bttsStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.btts })),
	...bttnsStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails.bttns })),
	...leagueRateStrategyVariations.map((strategy) => ({ ...strategy, ...marketDetails[strategy.market] }))
];

export async function load() {
	const summaries = await getStrategyPerformanceSeasonTotals(strategyDefinitions.map((strategy) => strategy.id));
	const summariesById = new Map(summaries.map((summary) => [summary.strategyId, summary.seasonPerformance]));

	const strategies = strategyDefinitions
		.map((strategy) => {
			const performance = summariesById.get(strategy.id);
			const bets = performance?.bets ?? 0;
			const profit = performance?.profit ?? 0;
			return {
				...strategy,
				bets,
				wins: performance?.wins ?? 0,
				losses: performance?.losses ?? 0,
				profit,
				returnOnInvestment: bets === 0 ? null : (profit / bets) * 100
			};
		})
		.filter((strategy) => strategy.bets >= minimumBetsForRanking)
		.sort(
			(left, right) =>
				(right.returnOnInvestment ?? Number.NEGATIVE_INFINITY) -
					(left.returnOnInvestment ?? Number.NEGATIVE_INFINITY) ||
				right.profit - left.profit
		)
		.slice(0, 10);

	return { strategies };
}
