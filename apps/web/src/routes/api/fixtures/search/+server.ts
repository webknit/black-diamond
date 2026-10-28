import { json } from '@sveltejs/kit';
import { searchFixtures } from '@black-diamond/database/fixtures';

export async function GET({ url }: { url: URL }) {
	const query = url.searchParams.get('q')?.trim() ?? '';
	if (query.length < 2) return json({ fixtures: [] });

	const fixtures = await searchFixtures(query);
	return json({
		fixtures: fixtures.map((fixture) => ({
			id: fixture.fixture.id,
			timestamp: fixture.fixture.timestamp,
			status: fixture.fixture.status.short,
			elapsed: fixture.fixture.status.elapsed,
			homeGoals: fixture.goals.home,
			awayGoals: fixture.goals.away,
			leagueName: fixture.league.name,
			homeTeamName: fixture.teams.home.name,
			awayTeamName: fixture.teams.away.name
		}))
	});
}
