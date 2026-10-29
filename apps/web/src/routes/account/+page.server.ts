import { addAccountDeposit } from '@black-diamond/database/accounts';
import { getBetsByAccountId, getPendingBetSummaryByAccountId } from '@black-diamond/database/bets';
import { hasPushSubscription } from '@black-diamond/database/pushSubscriptions';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');
	const [pendingBetSummary, bets, notificationsEnabled] = await Promise.all([
		getPendingBetSummaryByAccountId(locals.accountId),
		getBetsByAccountId(locals.accountId),
		hasPushSubscription(locals.accountId)
	]);
	return {
		vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? null,
		notificationsEnabled,
		pendingBetSummary,
		realizedProfitLoss: bets.reduce(
			(total, bet) => total + (bet.status === 'pending' ? 0 : (bet.profit ?? 0)),
			0
		),
	};
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
