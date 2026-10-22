import { SESSION_SECRET } from '$app/env/private';
import { getAccountByEmail } from '@black-diamond/database/accounts';
import { fail, redirect } from '@sveltejs/kit';
import { createSessionToken, sessionCookieName, sessionMaxAgeSeconds } from '#lib/server/auth/session.js';
import { verifyPassword } from '#lib/server/auth/hashPassword.js';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim().toLowerCase();
		const password = String(formData.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { email, message: 'Enter your email and password.' });
		}

		const account = await getAccountByEmail(email);
		if (!account || !(await verifyPassword(password, account.passwordHash))) {
			return fail(400, { email, message: 'Incorrect email or password.' });
		}

		cookies.set(sessionCookieName, createSessionToken(account.id, SESSION_SECRET), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: sessionMaxAgeSeconds
		});

		throw redirect(303, '/');
	}
};
