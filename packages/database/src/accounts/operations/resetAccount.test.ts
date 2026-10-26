import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	withDatabaseTransaction: vi.fn(),
	collection: vi.fn(),
	findOne: vi.fn(),
	deleteMany: vi.fn(),
	updateOne: vi.fn(),
	recordBalanceTransaction: vi.fn()
}));

vi.mock('../../mongodb.js', () => ({ withDatabaseTransaction: mocks.withDatabaseTransaction }));
vi.mock('../../balanceTransactions/recordBalanceTransaction.js', () => ({
	recordBalanceTransaction: mocks.recordBalanceTransaction
}));

import { resetAccount } from './resetAccount.js';

describe('resetAccount', () => {
	it('clears bets and history before creating a new opening balance', async () => {
		mocks.withDatabaseTransaction.mockImplementation(async (operation) =>
			operation({ collection: mocks.collection }, 'session')
		);
		mocks.collection.mockImplementation(() => ({
			findOne: mocks.findOne,
			deleteMany: mocks.deleteMany,
			updateOne: mocks.updateOne
		}));
		mocks.findOne.mockResolvedValue({ id: 'main' });

		await expect(resetAccount('main', 200, '2026-10-26T12:00:00.000Z')).resolves.toBe(true);

		expect(mocks.deleteMany).toHaveBeenCalledWith({ accountId: 'main' }, { session: 'session' });
		expect(mocks.updateOne).toHaveBeenCalledWith(
			{ id: 'main' },
			{ $set: { startingBalance: 200, totalDeposits: 200, currentBalance: 200, updatedAt: '2026-10-26T12:00:00.000Z' } },
			{ session: 'session' }
		);
		expect(mocks.recordBalanceTransaction).toHaveBeenCalledWith(expect.anything(), 'session', {
			accountId: 'main',
			type: 'opening_balance',
			amount: 200,
			balanceAfter: 200,
			occurredAt: '2026-10-26T12:00:00.000Z',
			referenceId: null
		});
	});
});
