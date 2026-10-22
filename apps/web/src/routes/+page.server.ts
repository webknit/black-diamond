import { randomUUID } from 'node:crypto';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getFixtureById, getFixtureSummariesBetweenDates } from '@black-diamond/database/fixtures';
import { getFixtureCardOdds, getFixtureOddsForFixtures } from '@black-diamond/database/fixtureOdds';
import { getFixtureCardSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { insufficientBalanceErrorCode, placeBet } from '@black-diamond/database/bets';
import { getBetsByAccountId } from '@black-diamond/database/bets';
import type { BetSelection } from '@black-diamond/core/bet';
import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getBetSelection } from '#lib/server/bets/getBetSelection.js';
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

export async function load({ url, locals }: { url: URL; locals: App.Locals }) {
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
	const placedBetSelectionKeys = locals.accountId
		? (await getBetsByAccountId(locals.accountId)).flatMap((bet) =>
				bet.selections.map((selection) =>
					`${selection.fixture.id}|${selection.market.name.toLowerCase()}|${selection.market.selection.toLowerCase()}`
				)
			)
		: [];

	return {
		date: selectedDate,
		placedBetSelectionKeys,
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

function getTextField(formData: FormData, field: string): string | null {
	const value = formData.get(field);
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

type SubmittedBetSelection = {
	fixtureId: unknown;
	marketName: unknown;
	value: unknown;
	odd: unknown;
};

function getSubmittedSelections(formData: FormData): SubmittedBetSelection[] | null {
	const value = getTextField(formData, 'selections');
	if (!value) return null;

	try {
		const selections: unknown = JSON.parse(value);
		return Array.isArray(selections) && selections.length > 0 && selections.length <= 20
			? selections as SubmittedBetSelection[]
			: null;
	} catch {
		return null;
	}
}

export const actions: Actions = {
	placeBet: async ({ request, locals, url }) => {
		if (!locals.accountId) throw redirect(303, '/login');

		const formData = await request.formData();
		const submittedSelections = getSubmittedSelections(formData);
		const stake = Number(getTextField(formData, 'stake'));
		const placedOdds = Number(getTextField(formData, 'placedOdds'));

		if (!submittedSelections || !Number.isFinite(stake) || stake <= 0 || !Number.isFinite(placedOdds) || placedOdds <= 1) {
			return fail(400, { betError: 'Choose valid selections, odds greater than 1.00, and a stake greater than £0.' });
		}

		const fixtureIds = submittedSelections.map((selection) => Number(selection.fixtureId));
		const selectionKeys = submittedSelections.map(
			(selection) => `${selection.fixtureId}|${selection.marketName}|${selection.value}`
		);
		if (
			fixtureIds.some((fixtureId) => !Number.isInteger(fixtureId)) ||
			new Set(selectionKeys).size !== selectionKeys.length
		) {
			return fail(400, { betError: 'Each price can only be included once in a bet.' });
		}

		const uniqueFixtureIds = [...new Set(fixtureIds)];
		const fixtureOdds = await getFixtureOddsForFixtures(uniqueFixtureIds);
		const oddsByFixtureId = new Map(fixtureOdds.map((odds) => [odds.fixtureId, odds]));
		const fixtures = await Promise.all(fixtureIds.map((fixtureId) => getFixtureById(fixtureId)));
		const selections: BetSelection[] = [];

		for (const [index, submitted] of submittedSelections.entries()) {
			const fixture = fixtures[index];
			const oddsDocument = oddsByFixtureId.get(fixtureIds[index]);
			if (!fixture) {
				return fail(400, { betError: 'One of these fixtures could no longer be found.' });
			}
			if (
				typeof submitted.marketName !== 'string' ||
				typeof submitted.value !== 'string' ||
				(submitted.odd !== null && typeof submitted.odd !== 'string')
			) {
				return fail(400, { betError: 'One of the selected prices is invalid.' });
			}
			const marketName = submitted.marketName;
			const selectionValue = submitted.value;
			const parsedSelection = getBetSelection(marketName, selectionValue);
			if (!parsedSelection) {
				return fail(400, { betError: 'One of the betting markets is not supported yet.' });
			}
			const market = oddsDocument?.odds.find(
				(candidate) => candidate.name.toLowerCase() === marketName.toLowerCase()
			);
			const price = market?.values.find(
				(candidate) => candidate.value.toLowerCase() === selectionValue.toLowerCase()
			);
			if (oddsDocument && (!market || !price || !Number.isFinite(Number(price.odd)))) {
				return fail(400, { betError: 'One of the selected reference markets is no longer available.' });
			}

			selections.push({
				fixture: {
					id: fixture.fixture.id,
					date: fixture.fixture.date,
					homeTeamName: fixture.teams.home.name,
					awayTeamName: fixture.teams.away.name
				},
				market: { ...parsedSelection, name: market?.name ?? marketName, selection: price?.value ?? selectionValue },
				referenceOdds: price ? Number(price.odd) : null,
				referenceOddsSource: price ? oddsDocument?.source ?? null : null
			});
		}

		const placedAt = new Date().toISOString();
		try {
			await placeBet({
				id: randomUUID(),
				accountId: locals.accountId,
				selections,
				placedOdds,
				stake,
				status: 'pending',
				returnAmount: null,
				profit: null,
				placedAt,
				settledAt: null
			});
		} catch (error) {
			if ((error as { code?: unknown }).code === insufficientBalanceErrorCode) {
				return fail(400, { betError: 'Your available balance is too low for that stake.' });
			}
			throw error;
		}

		throw redirect(303, `${url.pathname}${url.search}`);
	}
};
