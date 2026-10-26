import { getFixtureStatsSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { getFixtureCardOdds } from '@black-diamond/database/fixtureOdds';
import {
	getOver2_5ReferenceOdd,
	matchesTeamFilterVariation,
	teamFilterVariations
} from '@black-diamond/core/strategies';
import { actions, load as loadFixturePage } from '../+page.server.js';

export { actions };

const defaultStrategyId = 'score1.5-eitherTeam-last5';
const defaultMinimumOdds = 1.7;
const allStrategies = teamFilterVariations;

function getSelectedStrategyId(value: string | null) {
	return allStrategies.some((strategy) => strategy.id === value) ? value! : defaultStrategyId;
}

function getMinimumOdds(value: string | null) {
	if (value === null) return defaultMinimumOdds;
	const odds = Number(value);
	return Number.isFinite(odds) && odds >= 0 && odds <= 100 ? odds : defaultMinimumOdds;
}

export async function load({ url, locals }: { url: URL; locals: App.Locals }) {
	// Reuse the homepage loader so cards, prices, prediction data and bet actions
	// behave identically in both places. BOTD includes completed fixtures too, so
	// a past day can be reviewed against the selected strategy.
	const fixtureUrl = new URL(url);
	fixtureUrl.searchParams.set('limit', '1000');
	fixtureUrl.searchParams.set('ft', '1');
	fixtureUrl.searchParams.delete('leagues');
	const fixturePage = await loadFixturePage({ url: fixtureUrl, locals });
	const selectedStrategyId = getSelectedStrategyId(url.searchParams.get('strategy'));
	const minimumOdds = getMinimumOdds(url.searchParams.get('minOdds'));
	const selectedStrategy = allStrategies.find((strategy) => strategy.id === selectedStrategyId)!;
	const fixtureIds = fixturePage.fixtures.map((fixture) => fixture.id);
	const [snapshots, storedOdds] = await Promise.all([
		getFixtureStatsSnapshots(fixtureIds),
		getFixtureCardOdds(fixtureIds)
	]);
	const snapshotByFixtureId = new Map(snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
	const storedOddsByFixtureId = new Map(storedOdds.map((odds) => [odds.fixtureId, odds]));
	const teamFilterVariation = teamFilterVariations.find((strategy) => strategy.id === selectedStrategyId);

	const fixturesWithStoredOdds = fixturePage.fixtures.map((fixture) => {
		const storedFixtureOdds = storedOddsByFixtureId.get(fixture.id);
		return {
			...fixture,
			odds: fixture.odds ?? (storedFixtureOdds ? { odds: storedFixtureOdds.odds } : null)
		};
	});
	const fixtures = fixturesWithStoredOdds.filter((fixture) => {
		const snapshot = snapshotByFixtureId.get(fixture.id);
		if (!snapshot) return false;
		const referenceOdd = getOver2_5ReferenceOdd(fixture.odds?.odds ?? []);
		if (minimumOdds > 0 && (referenceOdd === null || referenceOdd < minimumOdds)) return false;

		return teamFilterVariation ? matchesTeamFilterVariation(snapshot, teamFilterVariation) : false;
	});

	return {
		...fixturePage,
		fixtures,
		totalFixtureCount: fixtures.length,
		hasFixtures: fixturePage.hasFixtures,
		selectedStrategyId,
		minimumOdds,
		selectedStrategy,
		strategies: allStrategies
	};
}
