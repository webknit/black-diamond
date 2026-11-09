import { closeDatabase, getDatabase } from '@black-diamond/database/mongodb';
import type { BalanceTransaction } from '@black-diamond/core/balanceTransaction';

const [accountId = 'main', confirmation] = process.argv.slice(2).filter((argument) => argument !== '--');

if (confirmation !== '--confirm') {
	throw new Error('This recalculates total deposits from the balance ledger. Re-run with: repair:account-deposits -- main --confirm');
}

const database = await getDatabase();
const deposits = await database
	.collection<BalanceTransaction>('balanceTransactions')
	.aggregate<{ total: number }>([
		{ $match: { accountId, type: { $in: ['opening_balance', 'deposit'] } } },
		{ $group: { _id: null, total: { $sum: '$amount' } } }
	])
	.toArray();
const totalDeposits = deposits[0]?.total ?? 0;

const updated = await database.collection('accounts').updateOne(
	{ id: accountId },
	{ $set: { totalDeposits, updatedAt: new Date().toISOString() } }
);

await closeDatabase();

if (!updated.matchedCount) throw new Error(`Account ${accountId} was not found.`);
console.info(`Set ${accountId} total deposits to £${totalDeposits.toFixed(2)} from its funding ledger.`);
