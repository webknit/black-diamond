import { getBotdDay } from '@black-diamond/database/botdDays';
import { botdStrategies } from '@black-diamond/core/strategies';
import { getUkDateKey } from '@black-diamond/core/time';
import { actions, load as loadFixtures } from '../+page.server.js';

export { actions };

const defaultStrategyId = 'score1.5-eitherTeam-last5';
const defaultMinimumOdds = 1.7;

function getSelectedStrategyId(value: string | null) {
	return botdStrategies.some((strategy) => strategy.id === value) ? value! : defaultStrategyId;
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
	const selectedStrategyId = getSelectedStrategyId(url.searchParams.get('strategy'));
	const minimumOdds = getMinimumOdds(url.searchParams.get('minOdds'));
	const selectedStrategy = botdStrategies.find((strategy) => strategy.id === selectedStrategyId)!;
	const botdDayStartedAt = performance.now();
	const botdDay = await getBotdDay(date);
	console.info('[botd] botdDays lookup', {
		date,
		milliseconds: Math.round(performance.now() - botdDayStartedAt),
		fixtureCount: botdDay?.fixtures.length ?? 0
	});
	const fixtureIds = (botdDay?.fixtures ?? [])
		.filter((fixture) => fixture.matchingStrategyIds.includes(selectedStrategyId))
		.filter((fixture) => minimumOdds === 0 || (fixture.over2_5ReferenceOdd !== null && fixture.over2_5ReferenceOdd >= minimumOdds))
		.map((fixture) => fixture.fixtureId);
	const fixtureUrl = new URL(url);
	fixtureUrl.searchParams.set('date', date);
	fixtureUrl.searchParams.set('fixtureIds', fixtureIds.join(','));
	fixtureUrl.searchParams.set('limit', '1000');
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
		strategies: botdStrategies
	};
}
