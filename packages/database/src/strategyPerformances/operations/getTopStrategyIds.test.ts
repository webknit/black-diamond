import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getStrategyPerformanceSeasonTotals: vi.fn() }));

vi.mock('./getStrategyPerformanceSeasonTotals.js', () => ({
	getStrategyPerformanceSeasonTotals: mocks.getStrategyPerformanceSeasonTotals
}));

import { getTopStrategyIds } from './getTopStrategyIds.js';

describe('getTopStrategyIds', () => {
	it('ranks strategies using only their configured bettable odds bands', async () => {
		mocks.getStrategyPerformanceSeasonTotals.mockResolvedValue([
			{
				strategyId: 'over',
				seasonPerformance: { bets: 100, wins: 70, losses: 30, profit: 30 },
				oddsBands: {
					'1-1.69': { seasonPerformance: { bets: 80, wins: 65, losses: 15, profit: 40 } },
					'1.70-1.99': { seasonPerformance: { bets: 50, wins: 30, losses: 20, profit: 10 } },
					'2.00-2.49': { seasonPerformance: { bets: 10, wins: 6, losses: 4, profit: 2 } },
					'2.50+': { seasonPerformance: { bets: 0, wins: 0, losses: 0, profit: 0 } }
				}
			},
			{
				strategyId: 'one-five',
				seasonPerformance: { bets: 100, wins: 70, losses: 30, profit: 30 },
				oddsBands: {
					'1-1.19': { seasonPerformance: { bets: 75, wins: 60, losses: 15, profit: 20 } },
					'1.20-1.39': { seasonPerformance: { bets: 50, wins: 30, losses: 20, profit: 8 } },
					'1.40-1.59': { seasonPerformance: { bets: 10, wins: 5, losses: 5, profit: 1 } },
					'1.60+': { seasonPerformance: { bets: 0, wins: 0, losses: 0, profit: 0 } }
				}
			}
		]);

		await expect(
			getTopStrategyIds(
				[
					{ id: 'over', market: 'over2_5' },
					{ id: 'one-five', market: 'over1_5' }
				],
				3
			)
		).resolves.toEqual(['over', 'one-five']);

		expect(mocks.getStrategyPerformanceSeasonTotals).toHaveBeenCalledWith(['over', 'one-five']);
	});
});
