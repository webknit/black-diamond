import { describe, expect, it } from 'vitest';
import { getOver2_5ReferenceOdd } from './getOver2_5ReferenceOdd.js';

describe('getOver2_5ReferenceOdd', () => {
	it('reads the Over 2.5 price from either API-Football market spelling', () => {
		expect(
			getOver2_5ReferenceOdd([
				{
					name: 'Goals Over Under',
					values: [{ value: 'Over 2.5', odd: '1.72' }]
				}
			])
		).toBe(1.72);
	});

	it('returns null when the market or a usable Over 2.5 price is missing', () => {
		expect(getOver2_5ReferenceOdd([])).toBeNull();
		expect(
			getOver2_5ReferenceOdd([
				{ name: 'Goals Over/Under', values: [{ value: 'Over 2.5', odd: '—' }] }
			])
		).toBeNull();
	});
});
