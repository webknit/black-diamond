import { error, json, redirect } from '@sveltejs/kit';
import { addFixturesToWatchlist } from '@black-diamond/database/fixtureWatchlist';

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	const body = await request.json().catch(() => null) as { fixtureIds?: unknown } | null;
	if (!Array.isArray(body?.fixtureIds)) throw error(400, 'Fixture IDs are required.');
	const fixtureIds = [...new Set(body.fixtureIds)]
		.filter((fixtureId): fixtureId is number => Number.isSafeInteger(fixtureId) && fixtureId > 0);
	if (fixtureIds.length === 0 || fixtureIds.length > 100) throw error(400, 'Invalid fixture IDs.');

	await addFixturesToWatchlist(locals.accountId, fixtureIds);
	return json({ fixtureIds });
}
