import { randomUUID } from 'node:crypto';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { insufficientBalanceErrorCode, placeBet } from '@black-diamond/database/bets';
import { getFixtureById } from '@black-diamond/database/fixtures';
import { getFixtureOddsForFixtures } from '@black-diamond/database/fixtureOdds';
import type { BetSelection } from '@black-diamond/core/bet';
import { getBetSelection } from './getBetSelection.js';

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

export async function placeBetAction({ request, locals }: Pick<RequestEvent, 'request' | 'locals'>) {
	if (!locals.accountId) throw redirect(303, '/login');

	const formData = await request.formData();
	const submittedSelections = getSubmittedSelections(formData);
	const stake = Number(getTextField(formData, 'stake'));
	const placedOdds = Number(getTextField(formData, 'placedOdds'));
	const matchStatus = formData.get('isUnmatched') === 'on' ? 'unmatched' : 'matched';

	if (!submittedSelections || !Number.isFinite(stake) || stake <= 0 || !Number.isFinite(placedOdds) || placedOdds <= 1) {
		return fail(400, { betError: 'Choose valid selections, odds greater than 1.00, and a stake greater than £0.' });
	}

	const fixtureIds = submittedSelections.map((selection) => Number(selection.fixtureId));
	const selectionKeys = submittedSelections.map(
		(selection) => `${selection.fixtureId}|${selection.marketName}|${selection.value}`
	);
	if (fixtureIds.some((fixtureId) => !Number.isInteger(fixtureId)) || new Set(selectionKeys).size !== selectionKeys.length) {
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
		if (!fixture) return fail(400, { betError: 'One of these fixtures could no longer be found.' });
		if (
			typeof submitted.marketName !== 'string' ||
			typeof submitted.value !== 'string' ||
			(submitted.odd !== null && typeof submitted.odd !== 'string')
		) return fail(400, { betError: 'One of the selected prices is invalid.' });

		const marketName = submitted.marketName;
		const selectionValue = submitted.value;
		const parsedSelection = getBetSelection(marketName, selectionValue);
		if (!parsedSelection) return fail(400, { betError: 'One of the betting markets is not supported yet.' });

		const market = oddsDocument?.odds.find(
			(candidate) => candidate.name.toLowerCase() === marketName.toLowerCase()
		);
		const price = market?.values.find(
			(candidate) => candidate.value.toLowerCase() === selectionValue.toLowerCase()
		);
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

	try {
		await placeBet({
			id: randomUUID(),
			accountId: locals.accountId,
			selections,
			placedOdds,
			stake,
			matchStatus,
			status: 'pending',
			returnAmount: null,
			profit: null,
			placedAt: new Date().toISOString(),
			settledAt: null
		});
	} catch (error) {
		if ((error as { code?: unknown }).code === insufficientBalanceErrorCode) {
			return fail(400, { betError: 'Your available balance is too low for that stake.' });
		}
		throw error;
	}

	return { success: true };
}
