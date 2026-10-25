import { describe, expect, it } from 'vitest';
import { matchesOver25Strategy } from './matchesOver25Strategy.js';

describe('matchesOver25Strategy', () => {
	it('matches only when both teams are above the league rate', () => {
		expect(matchesOver25Strategy(70, 65, 60)).toBe(true);
		expect(matchesOver25Strategy(70, 60, 60)).toBe(false);
		expect(matchesOver25Strategy(70, 65, null)).toBe(false);
	});
});
