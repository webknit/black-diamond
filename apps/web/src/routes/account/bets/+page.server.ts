import { deleteBet, getBetsByAccountId, markBetMatched } from '@black-diamond/database/bets';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	return { bets: await getBetsByAccountId(locals.accountId) };
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
		const bet = (await getBetsByAccountId(locals.accountId)).find((candidate) => candidate.id === betId);
		if (!bet || !(await deleteBet(bet))) return fail(404, { deleteError: 'That bet no longer exists.' });
		throw redirect(303, `${url.pathname}${url.search}`);
	}
};
