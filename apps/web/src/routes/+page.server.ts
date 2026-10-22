import { getFixtureSummariesBetweenDates } from '@black-diamond/database/fixtures';
import { getFixtureCardOdds } from '@black-diamond/database/fixtureOdds';
import { getFixtureCardSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';

const ukTimeZone = 'Europe/London';
const selectedLeagueOrder = new Map<number, number>(
	selectedLeagues.map((league, index) => [league.id, index])
);

function getUtcDateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function isDateKey(value: string | null): value is string {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	return getUtcDateKey(new Date(`${value}T00:00:00.000Z`)) === value;
}

function getOverallTotal(total: number, home: number, away: number): number {
	return Number.isFinite(total) ? total : home + away;
}

export async function load({ url }: { url: URL }) {
	const now = new Date();
	const todayUk = getUkDateKey(now);
	const requestedDate = url.searchParams.get('date');
	const selectedDate = isDateKey(requestedDate) ? requestedDate : todayUk;
	const selectedDateAtUtc = new Date(`${selectedDate}T00:00:00.000Z`);

	// The wider UTC window includes every instant in the selected UK calendar day,
	// including the hour that moves when British Summer Time starts or ends.
	const fixtures = await getFixtureSummariesBetweenDates(
		getUtcDateKey(new Date(selectedDateAtUtc.getTime() - 24 * 60 * 60 * 1000)),
		getUtcDateKey(new Date(selectedDateAtUtc.getTime() + 48 * 60 * 60 * 1000))
	);
	const todayFixtures = fixtures
		.filter((fixture) => getUkDateKey(new Date(fixture.fixture.timestamp * 1000)) === selectedDate)
		.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
	const fixtureIds = todayFixtures.map((fixture) => fixture.fixture.id);
	const [statsSnapshots, fixtureOdds] = await Promise.all([
		getFixtureCardSnapshots(fixtureIds),
		getFixtureCardOdds(fixtureIds)
	]);
	const statsByFixtureId = new Map(statsSnapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
	const oddsByFixtureId = new Map(fixtureOdds.map((odds) => [odds.fixtureId, odds]));

	return {
		date: selectedDate,
		fixtures: todayFixtures.map((fixture) => {
			const stats = statsByFixtureId.get(fixture.fixture.id);
			const odds = oddsByFixtureId.get(fixture.fixture.id);

			return {
				id: fixture.fixture.id,
				timestamp: fixture.fixture.timestamp,
				status: {
					short: fixture.fixture.status.short,
					long: fixture.fixture.status.long,
					elapsed: fixture.fixture.status.elapsed
				},
				round: fixture.league.round,
				leagueName: fixture.league.name,
				leagueId: fixture.league.id,
				leagueOrder: selectedLeagueOrder.get(fixture.league.id) ?? Number.MAX_SAFE_INTEGER,
				leagueCountry: fixture.league.country,
				leagueLogo: fixture.league.logo,
				venueName: fixture.fixture.venue.name,
				venueCity: fixture.fixture.venue.city,
				homeTeamName: fixture.teams.home.name,
				homeTeamLogo: fixture.teams.home.logo,
				awayTeamName: fixture.teams.away.name,
				awayTeamLogo: fixture.teams.away.logo,
				homeGoals: fixture.goals.home,
				awayGoals: fixture.goals.away,
				stats: stats
					? {
							home: {
								leaguePosition: stats.home.leaguePosition,
								leagueTeams: stats.home.leagueTeams,
								form: stats.home.form,
								formHome: stats.home.formHome,
								fixtures: {
									total: {
										played: stats.home.fixtures.total.played,
										goalsFor: getOverallTotal(
											stats.home.fixtures.total.goalsFor,
											stats.home.fixtures.home.goalsFor,
											stats.home.fixtures.away.goalsFor
										),
										goalsAgainst: getOverallTotal(
											stats.home.fixtures.total.goalsAgainst,
											stats.home.fixtures.home.goalsAgainst,
											stats.home.fixtures.away.goalsAgainst
										)
									},
									home: {
										played: stats.home.fixtures.home.played,
										wins: stats.home.fixtures.home.wins,
										draws: stats.home.fixtures.home.draws,
										loses: stats.home.fixtures.home.loses,
										goalsFor: stats.home.fixtures.home.goalsFor,
										goalsAgainst: stats.home.fixtures.home.goalsAgainst
									}
								},
								cleanSheets: {
									home: stats.home.cleanSheets.home,
									total: getOverallTotal(
										stats.home.cleanSheets.total,
										stats.home.cleanSheets.home,
										stats.home.cleanSheets.away
									)
								},
								summary: {
									wins: { percentage: stats.home.summary.wins.percentage },
									draws: { percentage: stats.home.summary.draws.percentage }
								}
							},
							away: {
								leaguePosition: stats.away.leaguePosition,
								leagueTeams: stats.away.leagueTeams,
								form: stats.away.form,
								formAway: stats.away.formAway,
								fixtures: {
									total: {
										played: stats.away.fixtures.total.played,
										goalsFor: getOverallTotal(
											stats.away.fixtures.total.goalsFor,
											stats.away.fixtures.home.goalsFor,
											stats.away.fixtures.away.goalsFor
										),
										goalsAgainst: getOverallTotal(
											stats.away.fixtures.total.goalsAgainst,
											stats.away.fixtures.home.goalsAgainst,
											stats.away.fixtures.away.goalsAgainst
										)
									},
									away: {
										played: stats.away.fixtures.away.played,
										wins: stats.away.fixtures.away.wins,
										draws: stats.away.fixtures.away.draws,
										loses: stats.away.fixtures.away.loses,
										goalsFor: stats.away.fixtures.away.goalsFor,
										goalsAgainst: stats.away.fixtures.away.goalsAgainst
									}
								},
								cleanSheets: {
									away: stats.away.cleanSheets.away,
									total: getOverallTotal(
										stats.away.cleanSheets.total,
										stats.away.cleanSheets.home,
										stats.away.cleanSheets.away
									)
								},
								summary: {
									wins: { percentage: stats.away.summary.wins.percentage },
									draws: { percentage: stats.away.summary.draws.percentage }
								}
							}
						}
					: null,
				odds: odds
					? {
							odds: odds.odds.map((market) => ({
								name: market.name,
								values: market.values.map(({ value, odd }) => ({ value, odd }))
							}))
						}
					: null
			};
		}),
		today: new Intl.DateTimeFormat('en-GB', {
			timeZone: ukTimeZone,
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		}).format(new Date(`${selectedDate}T12:00:00.000Z`))
	};
}
