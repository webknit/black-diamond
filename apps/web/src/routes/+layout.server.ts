import { getAccountById } from '@black-diamond/database/accounts';
import { getPendingBetSummaryByAccountId } from '@black-diamond/database/bets';

type LayoutAccount = {
	id: string;
	email: string;
	startingBalance: number;
	totalDeposits: number;
	currentBalance: number;
	currency: string;
	outstandingBetCount: number;
	outstandingBetStake: number;
};

export async function load({ locals }: { locals: App.Locals }): Promise<{ account: LayoutAccount | null }> {
	if (!locals.accountId) return { account: null };

	const account = await getAccountById(locals.accountId);
	if (!account) return { account: null };
	const pendingBets = await getPendingBetSummaryByAccountId(account.id);

	return {
		account: {
			id: account.id,
			email: account.email,
			startingBalance: account.startingBalance,
			totalDeposits: account.totalDeposits ?? 0,
			currentBalance: account.currentBalance,
			currency: account.currency,
			outstandingBetCount: pendingBets.count,
			outstandingBetStake: pendingBets.totalStake
		}
	};
}
