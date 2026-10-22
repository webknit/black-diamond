import { redirect } from '@sveltejs/kit';
import { sessionCookieName } from '#lib/server/auth/session.js';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(sessionCookieName, { path: '/' });
		throw redirect(303, '/');
	}
};
