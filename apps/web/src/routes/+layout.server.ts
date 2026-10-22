import { getAccountById } from '@black-diamond/database/accounts';

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) return { account: null };

	const account = await getAccountById(locals.accountId);
	if (!account) return { account: null };

	return {
		account: {
			id: account.id,
			email: account.email,
			startingBalance: account.startingBalance,
			totalDeposits: account.totalDeposits ?? 0,
			currentBalance: account.currentBalance,
			currency: account.currency
		}
	};
}
