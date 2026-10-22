import { addAccountDeposit } from '@black-diamond/database/accounts';
import { getPendingBetSummaryByAccountId } from '@black-diamond/database/bets';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	return { pendingBetSummary: await getPendingBetSummaryByAccountId(locals.accountId) };
}

export const actions: Actions = {
	addDeposit: async ({ request, locals }) => {
		if (!locals.accountId) throw redirect(303, '/login');

		const formData = await request.formData();
		const amountValue = formData.get('amount');
		if (
			typeof amountValue !== 'string' ||
			!/^\d+(?:\.\d{1,2})?$/.test(amountValue.trim()) ||
			Number(amountValue) <= 0 ||
			!Number.isFinite(Number(amountValue))
		) {
			return fail(400, { depositError: 'Enter a deposit amount greater than £0.00, using up to 2 decimal places.' });
		}

		const added = await addAccountDeposit(
			locals.accountId,
			Number(amountValue),
			new Date().toISOString()
		);
		if (!added) return fail(404, { depositError: 'The account could not be found.' });

		return { depositSuccess: true };
	}
};
