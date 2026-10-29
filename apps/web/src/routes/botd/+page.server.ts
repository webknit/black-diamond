import { getBotdDay } from '@black-diamond/database/botdDays';
import { botdStrategies, getBotdMarketLabel } from '@black-diamond/core/strategies';
import { getUkDateKey } from '@black-diamond/core/time';
import { getTopStrategyIds } from '@black-diamond/database/strategyPerformances';
import { actions, load as loadFixtures } from '../+page.server.js';

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
	const minimumOdds = getMinimumOdds(url.searchParams.get('minOdds'));
	const botdDayStartedAt = performance.now();
	const [botdDay, topStrategyIds] = await Promise.all([
		getBotdDay(date),
		getTopStrategyIds(botdStrategies.map((strategy) => strategy.id), 3)
	]);
	const strategies = topStrategyIds
		.map((strategyId) => botdStrategies.find((strategy) => strategy.id === strategyId))
		.filter((strategy): strategy is (typeof botdStrategies)[number] => strategy !== undefined);
	const selectedStrategyId = getSelectedStrategyId(url.searchParams.get('strategy'), strategies.map((strategy) => strategy.id));
	const selectedStrategy = strategies.find((strategy) => strategy.id === selectedStrategyId) ?? null;
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
			.filter((fixture) => fixture.match !== undefined)
			.filter((fixture) => minimumOdds === 0 || (fixture.match!.referenceOdd !== null && fixture.match!.referenceOdd >= minimumOdds))
			.map((fixture) => fixture.fixtureId);
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
		strategies,
		marketLabel: selectedStrategy ? getBotdMarketLabel(selectedStrategy.market) : null
	};
}
