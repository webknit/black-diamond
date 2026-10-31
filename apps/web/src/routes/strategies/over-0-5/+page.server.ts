import { getBettableOddsBandIds, over0_5OddsRanges, over0_5StrategyVariations, sumOddsBandPerformance } from '@black-diamond/core/strategies';
import { getStrategyPerformanceSummaries } from '@black-diamond/database/strategyPerformances';
export async function load({ url }: { url: URL }) {
	const requested = url.searchParams.get('odds') ?? 'bettable';
	const range = over0_5OddsRanges.find((item) => item.id === requested);
	const selectedOddsRange = requested === 'all' || requested === 'bettable' || range ? requested : 'bettable';
	const stored = await getStrategyPerformanceSummaries(over0_5StrategyVariations.map((s) => s.id), selectedOddsRange === 'all' ? null : selectedOddsRange);
	const availableWeeks = [...new Set(stored.flatMap((p) => Object.keys(p.weeks)))].sort((a, b) => b.localeCompare(a)); const requestedWeek = url.searchParams.get('week'); const selectedWeek = requestedWeek && availableWeeks.includes(requestedWeek) ? requestedWeek : 'all';
	return { selectedWeek, availableWeeks, selectedOddsRange, oddsRanges: over0_5OddsRanges, results: over0_5StrategyVariations.map((s) => { const p = stored.find((x) => x.strategyId === s.id); const t = selectedOddsRange === 'all' ? (selectedWeek === 'all' ? p?.seasonPerformance : p?.weeks[selectedWeek]) : selectedOddsRange === 'bettable' ? sumOddsBandPerformance(p?.oddsBands, getBettableOddsBandIds('over0_5'), selectedWeek) : sumOddsBandPerformance(p?.oddsBands, range!.bandIds, selectedWeek); const bets=t?.bets??0; return {...s,bets,wins:t?.wins??0,losses:t?.losses??0,profit:t?.profit??0,returnOnInvestment:bets ? (t?.profit??0)/bets*100:null}; }).sort((a,b)=>b.profit-a.profit) };
}
