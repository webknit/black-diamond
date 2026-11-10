import { describe, expect, it } from 'vitest';
import { getBettableMinimumOdds, getBettableOddsBandIds, getStrategyOddsRangeIds, sumOddsBandPerformance } from '@black-diamond/core/strategies';

describe('strategy odds helpers', () => {
	it('maps all market floors and non-overlapping bettable bands', () => {
		expect(getBettableMinimumOdds('over0_5')).toBe(1.08);
		expect(getBettableMinimumOdds('over1_5')).toBe(1.2);
		expect(getBettableMinimumOdds('over2_5')).toBe(1.7);
		expect(getBettableMinimumOdds('under1_5')).toBe(3);
		expect(getBettableOddsBandIds('over0_5')).toContain('1.08-1.10');
		expect(getBettableOddsBandIds('under1_5')).toEqual(['3.00+']);
	});
	it('handles odds-range boundaries and invalid prices', () => {
		expect(getStrategyOddsRangeIds(1)).toEqual([]);
		expect(getStrategyOddsRangeIds(1.08)).toContain('1.08-1.10');
		expect(getStrategyOddsRangeIds(1.7)).toContain('1.70-1.99');
		expect(getStrategyOddsRangeIds(3)).toContain('3.00+');
		expect(getStrategyOddsRangeIds(Number.NaN)).toEqual([]);
	});
	it('sums selected season and week bands without counting missing bands', () => {
		const bands = { a: { seasonPerformance: { bets: 2, wins: 1, losses: 1, profit: 0.5 }, weeks: { '2026-01-05': { bets: 1, wins: 1, losses: 0, profit: 1 } } }, b: { seasonPerformance: { bets: 3, wins: 2, losses: 1, profit: 2 } } };
		expect(sumOddsBandPerformance(bands, ['a', 'b', 'missing'], 'all')).toEqual({ bets: 5, wins: 3, losses: 2, profit: 2.5 });
		expect(sumOddsBandPerformance(bands, ['a', 'b'], '2026-01-05')).toEqual({ bets: 1, wins: 1, losses: 0, profit: 1 });
	});
});
