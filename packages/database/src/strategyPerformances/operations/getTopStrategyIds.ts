import { getStrategyPerformanceSeasonTotals } from './getStrategyPerformanceSeasonTotals.js';

export async function getTopStrategyIds(strategyIds: readonly string[], limit: number): Promise<string[]> {
	const summaries = await getStrategyPerformanceSeasonTotals(strategyIds);
	return summaries
		.map((summary) => ({
			strategyId: summary.strategyId,
			bets: summary.seasonPerformance.bets,
			profit: summary.seasonPerformance.profit,
			returnOnInvestment:
				summary.seasonPerformance.bets === 0
					? Number.NEGATIVE_INFINITY
					: (summary.seasonPerformance.profit / summary.seasonPerformance.bets) * 100
		}))
		.filter((summary) => summary.bets > 0)
		.sort((left, right) => right.profit - left.profit || right.returnOnInvestment - left.returnOnInvestment)
		.slice(0, limit)
		.map((summary) => summary.strategyId);
}
