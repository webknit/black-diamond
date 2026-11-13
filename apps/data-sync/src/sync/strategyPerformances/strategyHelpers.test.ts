import { describe, expect, it } from 'vitest';
import { getStrategyOddsRangeIds } from '@black-diamond/core/strategies';

describe('strategy odds helpers', () => {
	it('handles odds-range boundaries and invalid prices', () => {
		expect(getStrategyOddsRangeIds(1)).toEqual([]);
		expect(getStrategyOddsRangeIds(1.08)).toContain('1.08-1.10');
		expect(getStrategyOddsRangeIds(1.7)).toContain('1.70-1.99');
		expect(getStrategyOddsRangeIds(3)).toContain('3.00+');
		expect(getStrategyOddsRangeIds(Number.NaN)).toEqual([]);
	});
});
