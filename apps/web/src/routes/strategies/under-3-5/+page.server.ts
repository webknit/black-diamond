import { getUkWeekStartDateKey } from '@black-diamond/core/time';
import { getBettableOddsBandIds, sumOddsBandPerformance, type StrategyOddsFilter, under3_5OddsRanges, under3_5StrategyVariations } from '@black-diamond/core/strategies';
import { getStrategyPerformanceSummaries } from '@black-diamond/database/strategyPerformances';
import { minimumStrategyBetsForRanking } from '@black-diamond/core/strategies';

export async function load({ url }: { url: URL }) {
	const now = new Date(); const oldest = new Date(now); oldest.setUTCDate(oldest.getUTCDate() - 28);
	const requestedOddsRange = url.searchParams.get('odds');
	const selectedOddsRange: StrategyOddsFilter = requestedOddsRange === 'all' || requestedOddsRange === 'bettable' || under3_5OddsRanges.some((range) => range.id === requestedOddsRange) ? requestedOddsRange as StrategyOddsFilter : 'bettable';
	const stored = await getStrategyPerformanceSummaries(under3_5StrategyVariations.map((variation) => variation.id), selectedOddsRange === 'all' ? null : selectedOddsRange);
	const availableWeeks = [...new Set(stored.flatMap((performance) => Object.keys(performance.weeks)))].filter((week) => week >= getUkWeekStartDateKey(oldest) && week <= getUkWeekStartDateKey(now)).sort((left, right) => right.localeCompare(left));
	const requestedWeek = url.searchParams.get('week'); const selectedWeek = requestedWeek !== null && availableWeeks.includes(requestedWeek) ? requestedWeek : 'all';
	const results = under3_5StrategyVariations.map((variation) => {
		const performance = stored.find((item) => item.strategyId === variation.id); const oddsBand = selectedOddsRange === 'all' || selectedOddsRange === 'bettable' ? null : performance?.oddsBands?.[selectedOddsRange];
		const totals = selectedOddsRange === 'all' ? (selectedWeek === 'all' ? performance?.seasonPerformance : performance?.weeks[selectedWeek]) : selectedOddsRange === 'bettable' ? sumOddsBandPerformance(performance?.oddsBands, getBettableOddsBandIds('under3_5'), selectedWeek) : (selectedWeek === 'all' ? oddsBand?.seasonPerformance : oddsBand?.weeks[selectedWeek]);
		const bets = totals?.bets ?? 0; return { ...variation, bets, wins: totals?.wins ?? 0, losses: totals?.losses ?? 0, profit: totals?.profit ?? 0, returnOnInvestment: bets === 0 ? null : ((totals?.profit ?? 0) / bets) * 100 };
	}).filter((result) => result.bets >= minimumStrategyBetsForRanking).sort((left, right) => right.profit - left.profit || (right.returnOnInvestment ?? -Infinity) - (left.returnOnInvestment ?? -Infinity));
	return { selectedWeek, selectedOddsRange, oddsRanges: under3_5OddsRanges, availableWeeks, minimumBetsForRanking: minimumStrategyBetsForRanking, results };
}
