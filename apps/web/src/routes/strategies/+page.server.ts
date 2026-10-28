import { getUkWeekStartDateKey } from '@black-diamond/core/time';
import {
	over2_5RateStrategyVariations,
	over2_5OddsRanges,
	teamFilterVariations,
	type StrategyOddsFilter
} from '@black-diamond/core/strategies';
import { getStrategyPerformanceSummaries } from '@black-diamond/database/strategyPerformances';

export async function load({ url }: { url: URL }) {
	const now = new Date();
	const oldest = new Date(now);
	oldest.setUTCDate(oldest.getUTCDate() - 28);
	const currentWeek = getUkWeekStartDateKey(now);
	const oldestWeek = getUkWeekStartDateKey(oldest);
	const requestedOddsRange = url.searchParams.get('odds');
	const selectedOddsRange: StrategyOddsFilter =
		requestedOddsRange === 'all' || over2_5OddsRanges.some((range) => range.id === requestedOddsRange)
			? (requestedOddsRange as StrategyOddsFilter)
			: 'all';
	const strategyIds = [
		...teamFilterVariations.map((variation) => variation.id),
		...over2_5RateStrategyVariations.map((variation) => variation.id)
	];
	const storedPerformances = await getStrategyPerformanceSummaries(strategyIds);
	const availableWeeks = [...new Set(storedPerformances.flatMap((performance) => Object.keys(performance.weeks)))]
		.filter((week) => week >= oldestWeek && week <= currentWeek)
		.sort((left, right) => right.localeCompare(left));
	const requestedWeek = url.searchParams.get('week');
	const selectedWeek = requestedWeek !== null && availableWeeks.includes(requestedWeek) ? requestedWeek : 'all';
	const byStrategyId = new Map<string, { bets: number; wins: number; losses: number; profit: number }>();

	for (const storedPerformance of storedPerformances) {
		const oddsBand = selectedOddsRange === 'all' ? null : storedPerformance.oddsBands?.[selectedOddsRange];
		const totals = selectedOddsRange === 'all'
			? (selectedWeek === 'all' ? storedPerformance.seasonPerformance : storedPerformance.weeks[selectedWeek])
			: (selectedWeek === 'all' ? oddsBand?.seasonPerformance : oddsBand?.weeks[selectedWeek]);
		if (!totals) continue;

		const current = byStrategyId.get(storedPerformance.strategyId) ?? {
			bets: 0,
			wins: 0,
			losses: 0,
			profit: 0
		};
		current.bets += totals.bets;
		current.wins += totals.wins;
		current.losses += totals.losses;
		current.profit += totals.profit;
		byStrategyId.set(storedPerformance.strategyId, current);
	}

	function performance(strategyId: string) {
		const result = byStrategyId.get(strategyId);
		const bets = result?.bets ?? 0;
		const profit = result?.profit ?? 0;
		return {
			bets,
			wins: result?.wins ?? 0,
			losses: result?.losses ?? 0,
			profit,
			returnOnInvestment: bets === 0 ? null : (profit / bets) * 100,
			fixturesWithPreMatchOdds: 0,
			fixturesWithEligibleOdds: 0
		};
	}

	return {
		selectedWeek,
		selectedOddsRange,
		oddsRanges: over2_5OddsRanges,
		availableWeeks,
		teamFilterResults: [
			...teamFilterVariations
				.filter((variation) => variation.sample === 'last5')
				.map((variation) => ({
				...variation,
				...performance(variation.id),
				seasonPerformance: performance(variation.id.replace(/-last5$/, '-season'))
				})),
			...over2_5RateStrategyVariations.map((variation) => ({
				...variation,
				...performance(variation.id),
				seasonPerformance: null
			}))
		]
			.sort(
				(left, right) =>
					right.profit - left.profit ||
					(right.returnOnInvestment ?? Number.NEGATIVE_INFINITY) -
						(left.returnOnInvestment ?? Number.NEGATIVE_INFINITY)
			)
	};
}
