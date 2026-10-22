import { redirect } from '@sveltejs/kit';

export function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
}
