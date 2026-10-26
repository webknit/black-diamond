import { getApiFootballStatus } from '#lib/server/apiFootball/getApiFootballStatus.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');

	const apiKey = process.env.API_FOOTBALL_API_KEY;
	if (!apiKey) {
		return {
			status: null,
			error: 'API_FOOTBALL_API_KEY is not configured for the web app.'
		};
	}

	try {
		return {
			status: await getApiFootballStatus(apiKey),
			error: null,
			checkedAt: new Date().toISOString()
		};
	} catch (error) {
		return {
			status: null,
			error: error instanceof Error ? error.message : 'Unable to get the API-Football status.'
		};
	}
}
