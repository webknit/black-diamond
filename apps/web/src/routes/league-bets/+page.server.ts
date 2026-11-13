import { getBetsByAccountId } from '@black-diamond/database/bets';
import { getFixturesByIds } from '@black-diamond/database/fixtures';
import { getLeaguesByIds } from '@black-diamond/database/leagues';
import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');

	const [bets, configuredLeagues] = await Promise.all([
		getBetsByAccountId(locals.accountId),
		getLeaguesByIds(selectedLeagues.map((league) => league.id))
	]);
	const fixtureIds = [...new Set(bets.flatMap((bet) => bet.selections.map((selection) => selection.fixture.id)))];
	const fixtures = await getFixturesByIds(fixtureIds);
	const fixturesById = new Map(fixtures.map((fixture) => [fixture.fixture.id, fixture]));
	const leagues = new Map<number, {
		id: number;
		name: string;
		country: string;
		logo: string | null;
		total: number;
		marketCounts: Record<string, number>;
	}>();
	const markets = new Set<string>();

	for (const league of configuredLeagues) {
		leagues.set(league.league.id, {
			id: league.league.id,
			name: league.league.name,
			country: league.country.name,
			logo: league.league.logo,
			total: 0,
			marketCounts: {}
		});
	}

	for (const bet of bets) {
		for (const selection of bet.selections) {
			const fixture = fixturesById.get(selection.fixture.id);
			if (!fixture) continue;

			const market = `${selection.market.name}: ${selection.market.selection}`;
			const league = leagues.get(fixture.league.id) ?? {
				id: fixture.league.id,
				name: fixture.league.name,
				country: fixture.league.country,
				logo: fixture.league.logo,
				total: 0,
				marketCounts: {}
			};

			league.total += 1;
			league.marketCounts[market] = (league.marketCounts[market] ?? 0) + 1;
			leagues.set(league.id, league);
			markets.add(market);
		}
	}

	return {
		leagues: [...leagues.values()],
		markets: [...markets].sort((left, right) => left.localeCompare(right))
	};
}
