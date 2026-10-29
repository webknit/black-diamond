import { error } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getBetsForFixturesByAccountId } from '@black-diamond/database/bets';
import { getFixtureById } from '@black-diamond/database/fixtures';
import { getLeagueById } from '@black-diamond/database/leagues';
import { getFixtureCardOdds } from '@black-diamond/database/fixtureOdds';
import { getFixtureCardSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { getFixtureTeamNewsAvailability } from '@black-diamond/database/fixtureTeamNews';
import { placeBetAction } from '#lib/server/bets/placeBetAction.js';

export async function load({ params, locals }: { params: { fixtureId: string }; locals: App.Locals }) {
	const fixtureId = Number(params.fixtureId);
	if (!Number.isSafeInteger(fixtureId) || fixtureId <= 0) throw error(404, 'Fixture not found');

	const fixture = await getFixtureById(fixtureId);
	if (!fixture) throw error(404, 'Fixture not found');

	const [statsSnapshot, odds, teamNewsFixtureIds, bets, league] = await Promise.all([
		getFixtureCardSnapshots([fixtureId]).then((items) => items[0] ?? null),
		getFixtureCardOdds([fixtureId]).then((items) => items[0] ?? null),
		getFixtureTeamNewsAvailability([fixtureId]),
		locals.accountId ? getBetsForFixturesByAccountId(locals.accountId, [fixtureId]) : Promise.resolve([]),
		getLeagueById(fixture.league.id)
	]);

	return {
		placedBetSelectionKeys: bets.flatMap((bet) =>
			bet.selections.map(
				(selection) => `${selection.fixture.id}|${selection.market.name.toLowerCase()}|${selection.market.selection.toLowerCase()}`
			)
		),
		fixture: {
			id: fixture.fixture.id,
			timestamp: fixture.fixture.timestamp,
			status: fixture.fixture.status,
			round: fixture.league.round,
			leagueName: fixture.league.name,
			leagueId: fixture.league.id,
			leagueSeason: fixture.league.season,
			hasLeagueTable: league?.league.type !== 'Cup',
			leagueOrder: 0,
			leagueCountry: fixture.league.country,
			leagueLogo: fixture.league.logo,
			venueName: fixture.fixture.venue.name,
			venueCity: fixture.fixture.venue.city,
			homeTeamName: fixture.teams.home.name,
			homeTeamId: fixture.teams.home.id,
			homeTeamLogo: fixture.teams.home.logo,
			awayTeamName: fixture.teams.away.name,
			awayTeamId: fixture.teams.away.id,
			awayTeamLogo: fixture.teams.away.logo,
			homeGoals: fixture.goals.home,
			awayGoals: fixture.goals.away,
			fullTimeScore: fixture.score?.fulltime,
			extraTimeScore: fixture.score?.extratime,
			penaltyScore: fixture.score?.penalty ?? fixture.score?.penalties,
			stats: statsSnapshot ? { home: statsSnapshot.home, away: statsSnapshot.away } : null,
			odds: odds ? { odds: odds.odds.map((market) => ({ name: market.name, values: market.values.map(({ value, odd }) => ({ value, odd })) })) } : null,
			prediction: null,
			hasTeamNews: teamNewsFixtureIds.has(fixtureId)
		}
	};
}

export const actions: Actions = {
	placeBet: placeBetAction
};
