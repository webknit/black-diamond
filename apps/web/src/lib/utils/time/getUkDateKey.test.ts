import { describe, expect, it } from 'vitest';
import { getUkDateKey } from './getUkDateKey.js';

describe('getUkDateKey', () => {
	it('uses the UK calendar date through the start of British Summer Time', () => {
		expect(getUkDateKey(new Date('2026-03-29T23:30:00.000Z'))).toBe('2026-03-30');
	});

	it('uses the UK calendar date through the end of British Summer Time', () => {
		expect(getUkDateKey(new Date('2026-10-25T23:30:00.000Z'))).toBe('2026-10-25');
	});
});
