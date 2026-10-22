import {
	deleteBet,
	getBetPeriodSummary,
	getBetByIdAndAccountId,
	getBetsPage,
	markBetMatched
} from '@black-diamond/database/bets';
import { getFixtureScoresByIds } from '@black-diamond/database/fixtures';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';

const pageSize = 25;
const periods = [
	'all',
	'today',
	'this-week',
	'last-week',
	'this-month',
	'last-month',
	'this-year',
	'last-30-days'
] as const;
type Period = (typeof periods)[number];

function isPeriod(value: string | null): value is Period {
	return periods.some((period) => period === value);
}

function addDays(dateKey: string, days: number): string {
	const date = new Date(`${dateKey}T12:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

function getUkMidnight(dateKey: string): string {
	const approximate = new Date(`${dateKey}T00:00:00.000Z`);
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Europe/London',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(approximate);
	const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((value) => value.type === type)?.value);
	const representedAsUtc = Date.UTC(
		part('year'),
		part('month') - 1,
		part('day'),
		part('hour'),
		part('minute'),
		part('second')
	);
	return new Date(approximate.getTime() - (representedAsUtc - approximate.getTime())).toISOString();
}

function getPeriodRange(period: Period, today: string): { from: string; to: string } | undefined {
	if (period === 'all') return undefined;
	if (period === 'today') {
		return { from: getUkMidnight(today), to: getUkMidnight(addDays(today, 1)) };
	}
	const currentDay = new Date(`${today}T12:00:00.000Z`).getUTCDay();
	const monday = addDays(today, -((currentDay + 6) % 7));

	if (period === 'this-week') {
		return { from: getUkMidnight(monday), to: getUkMidnight(addDays(today, 1)) };
	}
	if (period === 'last-week') {
		return { from: getUkMidnight(addDays(monday, -7)), to: getUkMidnight(monday) };
	}
	if (period === 'this-month') {
		const monthStart = `${today.slice(0, 7)}-01`;
		const nextMonth = new Date(`${monthStart}T12:00:00.000Z`);
		nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
		return {
			from: getUkMidnight(monthStart),
			to: getUkMidnight(nextMonth.toISOString().slice(0, 10))
		};
	}
	if (period === 'last-month') {
		const monthStart = new Date(`${today.slice(0, 7)}-01T12:00:00.000Z`);
		monthStart.setUTCMonth(monthStart.getUTCMonth() - 1);
		const from = monthStart.toISOString().slice(0, 10);
		return {
			from: getUkMidnight(from),
			to: getUkMidnight(`${today.slice(0, 7)}-01`)
		};
	}
	if (period === 'this-year') {
		return {
			from: getUkMidnight(`${today.slice(0, 4)}-01-01`),
			to: getUkMidnight(addDays(today, 1))
		};
	}
	return { from: getUkMidnight(addDays(today, -29)), to: getUkMidnight(addDays(today, 1)) };
}

function getPeriodDateRange(period: Period, today: string): string {
	if (period === 'all') return 'All dates';
	const range = getPeriodRange(period, today);
	if (!range) return 'All dates';
	const fromDate = getUkDateKey(new Date(range.from));
	const throughDate = getUkDateKey(new Date(new Date(range.to).getTime() - 1));
	const format = (date: string) =>
		new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			dateStyle: 'medium'
		}).format(new Date(`${date}T12:00:00.000Z`));
	return `${format(fromDate)} – ${format(throughDate)}`;
}

export async function load({ locals, url }: { locals: App.Locals; url: URL }) {
	if (!locals.accountId) throw redirect(303, '/login');
	const requestedPeriod = url.searchParams.get('period');
	const period = isPeriod(requestedPeriod) ? requestedPeriod : 'all';
	const requestedPage = Number(url.searchParams.get('page') ?? '1');
	const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const range = getPeriodRange(period, getUkDateKey(new Date()));
	const dateRangeLabel = getPeriodDateRange(period, getUkDateKey(new Date()));
	const [result, summary] = await Promise.all([
		getBetsPage(locals.accountId, page, pageSize, range),
		getBetPeriodSummary(locals.accountId, range)
	]);
	const bets = result.items;
	const fixtureIds = [...new Set(bets.flatMap((bet) => bet.selections.map((selection) => selection.fixture.id)))];
	const fixtureScores = await getFixtureScoresByIds(fixtureIds);
	const scoresByFixtureId = new Map(fixtureScores.map((score) => [score.fixtureId, score]));
	return {
		period,
		dateRangeLabel,
		page: result.page,
		pageSize,
		totalCount: result.totalCount,
		summary,
		bets: bets.map((bet) => ({
			...bet,
			selections: bet.selections.map((selection) => ({
				...selection,
				score: scoresByFixtureId.get(selection.fixture.id) ?? null
			}))
		}))
	};
}

export const actions: Actions = {
	confirmMatched: async ({ request, locals, url }) => {
		if (!locals.accountId) throw redirect(303, '/login');
		const betId = (await request.formData()).get('betId');
		if (typeof betId !== 'string' || !(await markBetMatched(betId, locals.accountId))) return fail(404, { matchError: 'That unmatched bet no longer exists.' });
		throw redirect(303, `${url.pathname}${url.search}`);
	},
	deleteBet: async ({ request, locals, url }) => {
		if (!locals.accountId) throw redirect(303, '/login');
		const betId = (await request.formData()).get('betId');
		if (typeof betId !== 'string') return fail(400, { deleteError: 'Choose a valid bet to delete.' });
		const bet = await getBetByIdAndAccountId(betId, locals.accountId);
		if (!bet || !(await deleteBet(bet))) return fail(404, { deleteError: 'That bet no longer exists.' });
		throw redirect(303, `${url.pathname}${url.search}`);
	}
};
