import { getBotdDay } from '@black-diamond/database/botdDays';
import { botdStrategies, getBettableMinimumOdds, getBettableOddsBandIds, getBotdMarketLabel, sumOddsBandPerformance } from '@black-diamond/core/strategies';
import { getUkDateKey } from '@black-diamond/core/time';
import { actions, load as loadFixtures } from '../+page.server.js';
import { getStrategyPerformanceSeasonTotals } from '@black-diamond/database/strategyPerformances';

export { actions };

const defaultMinimumOdds = 0;

function getSelectedStrategyId(value: string | null, strategyIds: string[]) {
	return strategyIds.includes(value ?? '') ? value! : strategyIds[0] ?? null;
}

function getMinimumOdds(value: string | null) {
	if (value === null) return defaultMinimumOdds;
	const odds = Number(value);
	return Number.isFinite(odds) && odds >= 0 && odds <= 100 ? odds : defaultMinimumOdds;
}

function getSelectedDate(value: string | null) {
	return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : getUkDateKey(new Date());
}

export async function load({ url, locals }: { url: URL; locals: App.Locals }) {
	const startedAt = performance.now();
	const date = getSelectedDate(url.searchParams.get('date'));
	const botdDayStartedAt = performance.now();
	const botdDay = await getBotdDay(date);
	const strategyIds = [...new Set((botdDay?.fixtures ?? []).flatMap((fixture) => fixture.matches.filter((match) => match.leaguePerformance !== undefined).map((match) => match.strategyId)))];
	const strategies = strategyIds
		.map((strategyId) => botdStrategies.find((strategy) => strategy.id === strategyId))
		.filter((strategy): strategy is (typeof botdStrategies)[number] => strategy !== undefined);
	const selectedStrategyId = getSelectedStrategyId(url.searchParams.get('strategy'), strategies.map((strategy) => strategy.id));
	const selectedStrategy = strategies.find((strategy) => strategy.id === selectedStrategyId) ?? null;
	const selectedStrategySummary = selectedStrategy
		? (await getStrategyPerformanceSeasonTotals([selectedStrategy.id]))[0]
		: null;
	const selectedStrategyLeaguePerformances = selectedStrategy
		? (selectedStrategySummary?.leaguePerformances ?? []).map((league) => {
			const totals = sumOddsBandPerformance(league.oddsBands, getBettableOddsBandIds(selectedStrategy.market), 'all');
			const bets = totals?.bets ?? 0;
			const profit = totals?.profit ?? 0;
			return { leagueId: league.leagueId, name: league.name, country: league.country, bets, wins: totals?.wins ?? 0, losses: totals?.losses ?? 0, profit, returnOnInvestment: bets === 0 ? null : (profit / bets) * 100 };
		}).filter((league) => league.bets > 0).sort((left, right) => right.profit - left.profit)
		: [];
	const minimumOdds = url.searchParams.has('minOdds')
		? getMinimumOdds(url.searchParams.get('minOdds'))
		: selectedStrategy
			? getBettableMinimumOdds(selectedStrategy.market)
			: 0;
	console.info('[botd] botdDays lookup', {
		date,
		milliseconds: Math.round(performance.now() - botdDayStartedAt),
		fixtureCount: botdDay?.fixtures.length ?? 0
	});
	const fixtureIds = selectedStrategyId === null
		? []
		: (botdDay?.fixtures ?? [])
			.map((fixture) => ({
				fixtureId: fixture.fixtureId,
				match: fixture.matches?.find((match) => match.strategyId === selectedStrategyId)
			}))
			.filter((fixture) => fixture.match?.leaguePerformance !== undefined)
			.filter((fixture) => minimumOdds === 0 || (fixture.match!.referenceOdd !== null && fixture.match!.referenceOdd >= minimumOdds))
			.map((fixture) => fixture.fixtureId);
	const recommendationByFixtureId = Object.fromEntries(
		(botdDay?.fixtures ?? []).flatMap((fixture) => {
			const match = fixture.matches.find((item) => item.strategyId === selectedStrategyId);
			return match ? [[fixture.fixtureId, match]] : [];
		})
	);
	const fixtureUrl = new URL(url);
	fixtureUrl.searchParams.set('date', date);
	fixtureUrl.searchParams.set('fixtureIds', fixtureIds.join(','));
	fixtureUrl.searchParams.set('limit', '1000');
	fixtureUrl.searchParams.set('ft', '1');
	fixtureUrl.searchParams.delete('leagues');
	const fixturePageStartedAt = performance.now();
	const fixturePage = await loadFixtures({ url: fixtureUrl, locals });
	console.info('[botd] fixture-card load', {
		milliseconds: Math.round(performance.now() - fixturePageStartedAt),
		fixtureCount: fixtureIds.length
	});
	console.info('[botd] total load', { milliseconds: Math.round(performance.now() - startedAt) });

	return {
		...fixturePage,
		totalFixtureCount: fixturePage.fixtures.length,
		selectedStrategyId,
		minimumOdds,
		selectedStrategy,
		selectedStrategyLeaguePerformances,
		strategies,
		marketLabel: selectedStrategy ? getBotdMarketLabel(selectedStrategy.market) : null,
		recommendedMarket: selectedStrategy?.market ?? null
		,recommendationByFixtureId
	};
}
