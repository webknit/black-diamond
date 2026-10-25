import { describe, expect, it } from 'vitest';
import { matchesVenueScoringStrategy } from './matchesVenueScoringStrategy.js';

const snapshot = (homeGoalsFor: number, homePlayed: number, awayGoalsFor: number, awayPlayed: number) => ({
	home: { fixtures: { home: { goalsFor: homeGoalsFor, played: homePlayed } } },
	away: { fixtures: { away: { goalsFor: awayGoalsFor, played: awayPlayed } } }
}) as never;

describe('matchesVenueScoringStrategy', () => {
	it('requires both teams to average at least 1.5 goals in their relevant venue', () => {
		expect(matchesVenueScoringStrategy(snapshot(15, 10, 18, 12))).toBe(true);
		expect(matchesVenueScoringStrategy(snapshot(14, 10, 18, 12))).toBe(false);
		expect(matchesVenueScoringStrategy(snapshot(15, 10, 17, 12))).toBe(false);
	});

	it('does not match when either team has no relevant venue history', () => {
		expect(matchesVenueScoringStrategy(snapshot(0, 0, 18, 12))).toBe(false);
	});
});
