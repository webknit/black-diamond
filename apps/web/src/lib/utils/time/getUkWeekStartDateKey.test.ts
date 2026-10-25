import { describe, expect, it } from 'vitest';
import { getUkWeekStartDateKey } from './getUkWeekStartDateKey.js';

describe('getUkWeekStartDateKey', () => {
	it('returns the Monday of the UK calendar week', () => {
		expect(getUkWeekStartDateKey(new Date('2026-10-25T23:30:00.000Z'))).toBe('2026-10-19');
		expect(getUkWeekStartDateKey(new Date('2026-10-26T12:00:00.000Z'))).toBe('2026-10-26');
	});
});
