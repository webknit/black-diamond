import { getStrategyPerformanceSeasonTotals } from './getStrategyPerformanceSeasonTotals.js';
import { getBettableOddsBandIds, type BotdMarket } from '@black-diamond/core/strategies';

const minimumBetsForRanking = 50;


type StrategyForRanking = { id: string; market: BotdMarket };

function getBettableTotals(
	oddsBands: Record<string, { seasonPerformance: { bets: number; profit: number } }>,
	market: BotdMarket,
) {
	return getBettableOddsBandIds(market).reduce(
		(total, bandId) => {
			const performance = oddsBands[bandId]?.seasonPerformance;
			return {
				bets: total.bets + (performance?.bets ?? 0),
				profit: total.profit + (performance?.profit ?? 0),
			};
		},
		{ bets: 0, profit: 0 },
	);
}

export async function getTopStrategyIds(strategies: readonly StrategyForRanking[], limit: number): Promise<string[]> {
	const marketByStrategyId = new Map(strategies.map((strategy) => [strategy.id, strategy.market]));
	const summaries = await getStrategyPerformanceSeasonTotals(strategies.map((strategy) => strategy.id));
	return summaries
		.map((summary) => {
			const market = marketByStrategyId.get(summary.strategyId);
			const performance = market ? getBettableTotals(summary.oddsBands, market) : { bets: 0, profit: 0 };
			return {
			strategyId: summary.strategyId,
			bets: performance.bets,
			profit: performance.profit,
			returnOnInvestment:
				performance.bets === 0
					? Number.NEGATIVE_INFINITY
					: (performance.profit / performance.bets) * 100,
			};
		})
		.filter((summary) => summary.bets >= minimumBetsForRanking && summary.profit > 0)
		.sort((left, right) => right.returnOnInvestment - left.returnOnInvestment || right.profit - left.profit)
		.slice(0, limit)
		.map((summary) => summary.strategyId);
}
