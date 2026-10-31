import { getUkWeekStartDateKey } from '@black-diamond/core/time';
import { getBettableOddsBandIds, over2_5OddsRanges, sumOddsBandPerformance, type StrategyOddsFilter, under2_5StrategyVariations } from '@black-diamond/core/strategies';
import { getStrategyPerformanceSummaries } from '@black-diamond/database/strategyPerformances';

const minimumBetsForRanking = 50;

export async function load({ url }: { url: URL }) {
	const now = new Date();
	const oldest = new Date(now);
	oldest.setUTCDate(oldest.getUTCDate() - 28);
	const requestedOddsRange = url.searchParams.get('odds');
	const selectedOddsRange: StrategyOddsFilter = requestedOddsRange === 'all' || requestedOddsRange === 'bettable' || over2_5OddsRanges.some((range) => range.id === requestedOddsRange) ? requestedOddsRange as StrategyOddsFilter : 'bettable';
	const stored = await getStrategyPerformanceSummaries(under2_5StrategyVariations.map((variation) => variation.id), selectedOddsRange === 'all' ? null : selectedOddsRange);
	const oldestWeek = getUkWeekStartDateKey(oldest);
	const currentWeek = getUkWeekStartDateKey(now);
	const availableWeeks = [...new Set(stored.flatMap((performance) => Object.keys(performance.weeks)))].filter((week) => week >= oldestWeek && week <= currentWeek).sort((left, right) => right.localeCompare(left));
	const requestedWeek = url.searchParams.get('week');
	const selectedWeek = requestedWeek !== null && availableWeeks.includes(requestedWeek) ? requestedWeek : 'all';
	const results = under2_5StrategyVariations.map((variation) => {
		const performance = stored.find((item) => item.strategyId === variation.id);
		const oddsBand = selectedOddsRange === 'all' || selectedOddsRange === 'bettable' ? null : performance?.oddsBands?.[selectedOddsRange];
		const totals = selectedOddsRange === 'all' ? (selectedWeek === 'all' ? performance?.seasonPerformance : performance?.weeks[selectedWeek]) : selectedOddsRange === 'bettable' ? sumOddsBandPerformance(performance?.oddsBands, getBettableOddsBandIds('under2_5'), selectedWeek) : (selectedWeek === 'all' ? oddsBand?.seasonPerformance : oddsBand?.weeks[selectedWeek]);
		const bets = totals?.bets ?? 0;
		return { ...variation, bets, wins: totals?.wins ?? 0, losses: totals?.losses ?? 0, profit: totals?.profit ?? 0, returnOnInvestment: bets === 0 ? null : ((totals?.profit ?? 0) / bets) * 100 };
	}).filter((result) => result.bets >= minimumBetsForRanking).sort((left, right) => right.profit - left.profit || (right.returnOnInvestment ?? -Infinity) - (left.returnOnInvestment ?? -Infinity));
	return { selectedWeek, selectedOddsRange, oddsRanges: over2_5OddsRanges, availableWeeks, results };
}
