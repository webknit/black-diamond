import { error, json } from '@sveltejs/kit';
import { getFixtureById, getRecentTeamFixturesBefore } from '@black-diamond/database/fixtures';

const validVenues = new Set(['home', 'away', 'overall']);

export async function GET({ params, url }: { params: { fixtureId: string }; url: URL }) {
	const fixtureId = Number(params.fixtureId);
	const teamId = Number(url.searchParams.get('teamId'));
	const venue = url.searchParams.get('venue');
	if (!Number.isSafeInteger(fixtureId) || !Number.isSafeInteger(teamId) || venue === null || !validVenues.has(venue)) {
		throw error(400, 'Invalid form request');
	}

	const fixture = await getFixtureById(fixtureId);
	if (!fixture) throw error(404, 'Fixture not found');
	if (fixture.teams.home.id !== teamId && fixture.teams.away.id !== teamId) {
		throw error(400, 'Team does not play in this fixture');
	}

	const fixtures = await getRecentTeamFixturesBefore(
		fixture.league.id,
		fixture.league.season,
		teamId,
		fixture.fixture.timestamp,
		venue as 'home' | 'away' | 'overall',
	);

	return json({
		fixtures: fixtures.map((item) => {
			const isHome = item.teams.home.id === teamId;
			const goalsFor = isHome ? item.goals.home : item.goals.away;
			const goalsAgainst = isHome ? item.goals.away : item.goals.home;
			return {
				id: item.fixture.id,
				timestamp: item.fixture.timestamp,
				opponent: isHome ? item.teams.away.name : item.teams.home.name,
				opponentLogo: isHome ? item.teams.away.logo : item.teams.home.logo,
				venue: isHome ? 'Home' : 'Away',
				homeGoals: item.goals.home,
				awayGoals: item.goals.away,
				outcome: goalsFor! > goalsAgainst! ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
			};
		})
	});
}
