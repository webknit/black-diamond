import { error, json } from '@sveltejs/kit';
import { getLeagueStandings } from '@black-diamond/database/leagueStandings';

export async function GET({ params }: { params: { leagueId: string; season: string } }) {
	const leagueId = Number(params.leagueId);
	const season = Number(params.season);

	if (!Number.isSafeInteger(leagueId) || !Number.isSafeInteger(season)) {
		error(400, 'Invalid league table request.');
	}

	return json(await getLeagueStandings(leagueId, season));
}
