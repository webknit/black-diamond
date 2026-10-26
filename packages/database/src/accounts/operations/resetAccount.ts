import { recordBalanceTransaction } from '../../balanceTransactions/recordBalanceTransaction.js';
import { withDatabaseTransaction } from '../../mongodb.js';

export async function resetAccount(
	accountId: string,
	startingBalance: number,
	updatedAt: string
): Promise<boolean> {
	if (!Number.isFinite(startingBalance) || startingBalance < 0) {
		throw new Error('Starting balance must be a non-negative finite number');
	}
	if (Math.round(startingBalance * 100) / 100 !== startingBalance) {
		throw new Error('Starting balance must have no more than two decimal places');
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
					startingBalance,
					totalDeposits: startingBalance,
					currentBalance: startingBalance,
					updatedAt
				}
			},
			{ session }
		);
		await recordBalanceTransaction(database, session, {
			accountId,
			type: 'opening_balance',
			amount: startingBalance,
			balanceAfter: startingBalance,
			occurredAt: updatedAt,
			referenceId: null
		});

		return true;
	});
}
