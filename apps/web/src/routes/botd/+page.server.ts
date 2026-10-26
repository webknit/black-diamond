import { getFixtureStatsSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { getLeagueStats } from '@black-diamond/database/leagueStats';
import {
	getOver2_5ReferenceOdd,
	matchesOver2_5LeagueAverageStrategy,
	matchesTeamFilterVariation,
	strategyDetails,
	teamFilterVariations
} from '@black-diamond/core/strategies';
import { actions, load as loadFixturePage } from '../+page.server.js';

export { actions };

const defaultStrategyId = 'score1.5-eitherTeam-last5';
const defaultMinimumOdds = 1.7;
const allStrategies = [...strategyDetails, ...teamFilterVariations];

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
	// behave identically in both places. BOTD only needs upcoming fixtures.
	const fixtureUrl = new URL(url);
	fixtureUrl.searchParams.set('limit', '1000');
	fixtureUrl.searchParams.set('ft', '0');
	fixtureUrl.searchParams.delete('leagues');
	const fixturePage = await loadFixturePage({ url: fixtureUrl, locals });
	const selectedStrategyId = getSelectedStrategyId(url.searchParams.get('strategy'));
	const minimumOdds = getMinimumOdds(url.searchParams.get('minOdds'));
	const selectedStrategy = allStrategies.find((strategy) => strategy.id === selectedStrategyId)!;
	const fixtureIds = fixturePage.fixtures
		.filter((fixture) => fixture.status.short === 'NS')
		.map((fixture) => fixture.id);
	const leagueIds = [...new Set(fixturePage.fixtures.map((fixture) => fixture.leagueId))];
	const [snapshots, leagueStats] = await Promise.all([
		getFixtureStatsSnapshots(fixtureIds),
		getLeagueStats(leagueIds)
	]);
	const snapshotByFixtureId = new Map(snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
	const leagueStatsByLeagueId = new Map(leagueStats.map((stats) => [stats.league.id, stats]));
	const teamFilterVariation = teamFilterVariations.find((strategy) => strategy.id === selectedStrategyId);

	const fixtures = fixturePage.fixtures.filter((fixture) => {
		if (fixture.status.short !== 'NS') return false;
		const snapshot = snapshotByFixtureId.get(fixture.id);
		if (!snapshot) return false;
		const referenceOdd = getOver2_5ReferenceOdd(fixture.odds?.odds ?? []);
		if (minimumOdds > 0 && (referenceOdd === null || referenceOdd < minimumOdds)) return false;

		if (selectedStrategyId === 'bothTeamsAboveLeagueAverage') {
			return matchesOver2_5LeagueAverageStrategy(
				snapshot,
				leagueStatsByLeagueId.get(fixture.leagueId)?.over2_5.percentage ?? null
			);
		}
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
