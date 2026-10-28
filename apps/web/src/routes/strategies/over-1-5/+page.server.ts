import {
	over1_5OddsRanges,
	over1_5StrategyVariations,
	type StrategyOddsFilter
} from '@black-diamond/core/strategies';
import { getUkWeekStartDateKey } from '@black-diamond/core/time';
import { getStrategyPerformanceSummaries } from '@black-diamond/database/strategyPerformances';

export async function load({ url }: { url: URL }) {
	const now = new Date();
	const oldest = new Date(now);
	oldest.setUTCDate(oldest.getUTCDate() - 28);
	const currentWeek = getUkWeekStartDateKey(now);
	const oldestWeek = getUkWeekStartDateKey(oldest);
	const requestedOddsRange = url.searchParams.get('odds');
	const selectedOddsRange: StrategyOddsFilter =
		requestedOddsRange === 'all' || over1_5OddsRanges.some((range) => range.id === requestedOddsRange)
			? (requestedOddsRange as StrategyOddsFilter)
			: 'all';
	const performances = await getStrategyPerformanceSummaries(
		over1_5StrategyVariations.map((variation) => variation.id),
		selectedOddsRange === 'all' ? null : selectedOddsRange
	);
	const availableWeeks = [...new Set(performances.flatMap((performance) => Object.keys(performance.weeks)))]
		.filter((week) => week >= oldestWeek && week <= currentWeek)
		.sort((left, right) => right.localeCompare(left));
	const requestedWeek = url.searchParams.get('week');
	const selectedWeek = requestedWeek !== null && availableWeeks.includes(requestedWeek) ? requestedWeek : 'all';
	const totalsByStrategy = new Map<string, { bets: number; wins: number; losses: number; profit: number }>();
	for (const performance of performances) {
		const oddsBand = selectedOddsRange === 'all' ? null : performance.oddsBands?.[selectedOddsRange];
		const totals = selectedOddsRange === 'all'
			? (selectedWeek === 'all' ? performance.seasonPerformance : performance.weeks[selectedWeek])
			: (selectedWeek === 'all' ? oddsBand?.seasonPerformance : oddsBand?.weeks[selectedWeek]);
		if (!totals) continue;
		const current = totalsByStrategy.get(performance.strategyId) ?? { bets: 0, wins: 0, losses: 0, profit: 0 };
		current.bets += totals.bets;
		current.wins += totals.wins;
		current.losses += totals.losses;
		current.profit += totals.profit;
		totalsByStrategy.set(performance.strategyId, current);
	}
	return {
		selectedWeek,
		selectedOddsRange,
		availableWeeks,
		oddsRanges: over1_5OddsRanges,
		results: over1_5StrategyVariations
			.map((variation) => {
				const totals = totalsByStrategy.get(variation.id) ?? { bets: 0, wins: 0, losses: 0, profit: 0 };
				return { ...variation, ...totals, returnOnInvestment: totals.bets === 0 ? null : (totals.profit / totals.bets) * 100 };
			})
			.sort((left, right) => right.profit - left.profit || (right.returnOnInvestment ?? -Infinity) - (left.returnOnInvestment ?? -Infinity))
	};
}
