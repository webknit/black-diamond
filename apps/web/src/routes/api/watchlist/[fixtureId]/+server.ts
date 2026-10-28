import { error, json, redirect } from '@sveltejs/kit';
import { toggleFixtureWatchlist } from '@black-diamond/database/fixtureWatchlist';
export async function POST({ params, locals }: { params: { fixtureId: string }; locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	const fixtureId = Number(params.fixtureId);
	if (!Number.isSafeInteger(fixtureId) || fixtureId <= 0) throw error(400, 'Invalid fixture.');
	return json({ starred: await toggleFixtureWatchlist(locals.accountId, fixtureId) });
}
