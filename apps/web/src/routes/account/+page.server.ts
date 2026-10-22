import { redirect } from '@sveltejs/kit';
import { getPendingBetSummaryByAccountId } from '@black-diamond/database/bets';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	return { pendingBetSummary: await getPendingBetSummaryByAccountId(locals.accountId) };
}
