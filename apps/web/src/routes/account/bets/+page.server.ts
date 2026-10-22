import { getBetsByAccountId } from '@black-diamond/database/bets';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	return { bets: await getBetsByAccountId(locals.accountId) };
}
