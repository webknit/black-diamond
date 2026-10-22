import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getLeagueStandingsForLeagues } from '@black-diamond/database/leagueStandings';

const selectedLeagueOrder = new Map<number, number>(
	selectedLeagues.map((league, index) => [league.id, index])
);

export async function load({ url }: { url: URL }) {
	const allStandings = await getLeagueStandingsForLeagues(
		selectedLeagues.map((league) => league.id)
	);
	const standings = allStandings.sort(
		(a, b) =>
			(selectedLeagueOrder.get(a.league.id) ?? Number.MAX_SAFE_INTEGER) -
			(selectedLeagueOrder.get(b.league.id) ?? Number.MAX_SAFE_INTEGER)
	);
	const requestedLeagueId = Number(url.searchParams.get('league'));
	const selectedStanding =
		standings.find((standing) => standing.league.id === requestedLeagueId) ?? standings[0] ?? null;

	return {
		availableLeagues: standings.map((standing) => ({
			id: standing.league.id,
			name: standing.league.name,
			country: standing.league.country
		})),
		standings: selectedStanding
	};
}
