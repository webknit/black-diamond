import { redirect } from '@sveltejs/kit';
import { getFixtureById } from '@black-diamond/database/fixtures';
import { getFixtureCardOdds } from '@black-diamond/database/fixtureOdds';
import { getFixtureCardSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { getWatchlistFixtureIds } from '@black-diamond/database/fixtureWatchlist';
import { getLeaguesByIds } from '@black-diamond/database/leagues';
import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';

export async function load({ url, locals }: { url: URL; locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	const today = getUkDateKey(new Date());
	const requestedDate = url.searchParams.get('date');
	const date = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : today;
	const fixtureIds = await getWatchlistFixtureIds(locals.accountId);
	const savedFixtures = (await Promise.all(fixtureIds.map(getFixtureById)))
		.filter((fixture): fixture is NonNullable<typeof fixture> => fixture !== null)
		.filter((fixture) => getUkDateKey(new Date(fixture.fixture.timestamp * 1000)) === date)
		.sort((left, right) => left.fixture.timestamp - right.fixture.timestamp);
	const fixtureIdsForDate = savedFixtures.map((fixture) => fixture.fixture.id);
	const [odds, snapshots, leagueDocuments] = await Promise.all([
		getFixtureCardOdds(fixtureIdsForDate),
		getFixtureCardSnapshots(fixtureIdsForDate),
		getLeaguesByIds([...new Set(savedFixtures.map((fixture) => fixture.league.id))])
	]);
	const oddsByFixtureId = new Map(odds.map((odds) => [odds.fixtureId, odds]));
	const statsByFixtureId = new Map(snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
	const leaguesById = new Map(leagueDocuments.map((league) => [league.league.id, league]));
	const fixtures = savedFixtures
		.map((fixture) => ({
			id: fixture.fixture.id,
			timestamp: fixture.fixture.timestamp,
			status: { short: fixture.fixture.status.short, long: fixture.fixture.status.long, elapsed: fixture.fixture.status.elapsed },
			round: fixture.league.round, leagueName: fixture.league.name, leagueId: fixture.league.id, leagueSeason: fixture.league.season, hasLeagueTable: leaguesById.get(fixture.league.id)?.league.type !== 'Cup', leagueOrder: 0, leagueCountry: fixture.league.country, leagueLogo: fixture.league.logo,
			venueName: fixture.fixture.venue.name, venueCity: fixture.fixture.venue.city,
			homeTeamName: fixture.teams.home.name, homeTeamId: fixture.teams.home.id, homeTeamLogo: fixture.teams.home.logo,
			awayTeamName: fixture.teams.away.name, awayTeamId: fixture.teams.away.id, awayTeamLogo: fixture.teams.away.logo,
			homeGoals: fixture.goals.home, awayGoals: fixture.goals.away,
			stats: statsByFixtureId.get(fixture.fixture.id) ?? null, prediction: null, events: [], statistics: null, injuries: null, lineups: null,
			odds: oddsByFixtureId.get(fixture.fixture.id) ?? null
		}));
	return { date, fixtures };
}
