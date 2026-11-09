import { recordBalanceTransaction } from '../../balanceTransactions/recordBalanceTransaction.js';
import { withDatabaseTransaction } from '../../mongodb.js';

export async function resetAccount(
	accountId: string,
	initialDeposit: number,
	updatedAt: string
): Promise<boolean> {
	if (!Number.isFinite(initialDeposit) || initialDeposit < 0) {
		throw new Error('Initial deposit must be a non-negative finite number');
	}
	if (Math.round(initialDeposit * 100) / 100 !== initialDeposit) {
		throw new Error('Initial deposit must have no more than two decimal places');
	}

	return withDatabaseTransaction(async (database, session) => {
		const accounts = database.collection('accounts');
		const account = await accounts.findOne({ id: accountId }, { session, projection: { _id: 0, id: 1 } });
		if (!account) return false;

		await database.collection('bets').deleteMany({ accountId }, { session });
		await database.collection('balanceTransactions').deleteMany({ accountId }, { session });
		await accounts.updateOne(
			{ id: accountId },
			{
				$set: {
					// Kept as a legacy mirror for older deployments. New code uses only
					// `totalDeposits` as the canonical funding value.
					startingBalance: initialDeposit,
					totalDeposits: initialDeposit,
					currentBalance: initialDeposit,
					updatedAt
				}
			},
			{ session }
		);
		await recordBalanceTransaction(database, session, {
			accountId,
			type: 'opening_balance',
			amount: initialDeposit,
			balanceAfter: initialDeposit,
			occurredAt: updatedAt,
			referenceId: null
		});

		return true;
	});
}
