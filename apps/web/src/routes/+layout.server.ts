import { getAccountById } from '@black-diamond/database/accounts';
import { getPendingBetSummaryByAccountId } from '@black-diamond/database/bets';
import { hasPushSubscription } from '@black-diamond/database/pushSubscriptions';

type LayoutAccount = {
	id: string;
	email: string;
	totalDeposits: number;
	currentBalance: number;
	currency: string;
	outstandingBetCount: number;
	outstandingBetStake: number;
};

export async function load({ locals }: { locals: App.Locals }): Promise<{ account: LayoutAccount | null; hasPushSubscription: boolean }> {
	if (!locals.accountId) return { account: null, hasPushSubscription: false };

	const account = await getAccountById(locals.accountId);
	if (!account) return { account: null, hasPushSubscription: false };
	const [pendingBets, hasSubscription] = await Promise.all([
		getPendingBetSummaryByAccountId(account.id),
		hasPushSubscription(account.id)
	]);

	return {
		account: {
			id: account.id,
			email: account.email,
			totalDeposits: account.totalDeposits ?? 0,
			currentBalance: account.currentBalance,
			currency: account.currency,
			outstandingBetCount: pendingBets.count,
			outstandingBetStake: pendingBets.totalStake
		},
		hasPushSubscription: hasSubscription
	};
}
