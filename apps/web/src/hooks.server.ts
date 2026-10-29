import { configureDatabase } from '@black-diamond/database/mongodb';
import { MONGODB_DATABASE, MONGODB_URI, SESSION_SECRET } from '$app/env/private';
import type { Handle } from '@sveltejs/kit/hooks';
import { getSessionAccountId, sessionCookieName } from '#lib/server/auth/session.js';

configureDatabase({ connectionString: MONGODB_URI, databaseName: MONGODB_DATABASE });

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.accountId = getSessionAccountId(
		event.cookies.get(sessionCookieName),
		SESSION_SECRET
	);

	return resolve(event);
};
