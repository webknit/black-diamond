import { getBotdDay } from '@black-diamond/database/botdDays';
import { botdStrategies, getBettableMinimumOdds, type BotdMarket } from '@black-diamond/core/strategies';
import { getUkDateKey } from '@black-diamond/core/time';
import { actions, load as loadFixtures } from '../+page.server.js';

export { actions };

const markets: BotdMarket[] = ['over2_5', 'over1_5', 'over0_5', 'under2_5', 'under1_5', 'btts', 'bttns'];

function getSelectedDate(value: string | null) {
	return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : getUkDateKey(new Date());
}

export async function load({ url, locals }: { url: URL; locals: App.Locals }) {
	const startedAt = performance.now();
	const date = getSelectedDate(url.searchParams.get('date'));
	const botdDayStartedAt = performance.now();
	const botdDay = await getBotdDay(date);
	const selectedMarket = markets.includes(url.searchParams.get('market') as BotdMarket) ? url.searchParams.get('market') as BotdMarket : null;
	console.info('[botd] botdDays lookup', {
		date,
		milliseconds: Math.round(performance.now() - botdDayStartedAt),
		fixtureCount: botdDay?.fixtures.length ?? 0
	});
	const tierScore = { lowConfidence: 1, eligible: 2, strong: 3, highConfidence: 4 };
	const recommendations = (botdDay?.fixtures ?? []).flatMap((fixture) => {
		const matches = fixture.matches.flatMap((match) => {
			const strategy = botdStrategies.find((item) => item.id === match.strategyId);
			if (!strategy || !match.leaguePerformance || (selectedMarket !== null && strategy.market !== selectedMarket)) return [];
			if (match.referenceOdd === null || match.referenceOdd < getBettableMinimumOdds(strategy.market)) return [];
			return [{ ...match, market: strategy.market, strategyTitle: strategy.title }];
		}).sort((left, right) => tierScore[right.tier] - tierScore[left.tier] || (right.leaguePerformance.profit / (right.leaguePerformance.bets + 30)) - (left.leaguePerformance.profit / (left.leaguePerformance.bets + 30)));
		return matches[0] ? [{ fixtureId: fixture.fixtureId, recommendation: matches[0] }] : [];
	});
	const fixtureIds = recommendations.map((item) => item.fixtureId);
	const recommendationByFixtureId = Object.fromEntries(recommendations.map((item) => [item.fixtureId, item.recommendation]));
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
		selectedMarket,
		markets,
		recommendedMarket: null,
		recommendationByFixtureId
	};
}
