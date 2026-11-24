import { describe, expect, it } from 'vitest';
import {
	bttnsStrategyVariations,
	matchesBttnsStrategyVariation
} from '@black-diamond/core/strategies';

function snapshot({
	homeGoalsFor = 1,
	awayGoalsFor = 1,
	homeGoalsAgainst = 1,
	awayGoalsAgainst = 1,
	homeBtts = 60,
	awayBtts = 60,
	homeFailedToScore = 0,
	awayFailedToScore = 0,
	homeCleanSheets = 0,
	awayCleanSheets = 0
}: {
	homeGoalsFor?: number;
	awayGoalsFor?: number;
	homeGoalsAgainst?: number;
	awayGoalsAgainst?: number;
	homeBtts?: number;
	awayBtts?: number;
	homeFailedToScore?: number;
	awayFailedToScore?: number;
	homeCleanSheets?: number;
	awayCleanSheets?: number;
} = {}) {
	const record = (goalsFor: number, goalsAgainst: number, btts: number, failedToScore: number, cleanSheets: number) => ({
		played: 5,
		goalsFor: goalsFor * 5,
		goalsAgainst: goalsAgainst * 5,
		failedToScore,
		cleanSheets,
		summary: { btts: { count: (btts / 100) * 5, percentage: btts } }
	});

	return {
		home: { last5Venue: record(homeGoalsFor, homeGoalsAgainst, homeBtts, homeFailedToScore, homeCleanSheets) },
		away: { last5Venue: record(awayGoalsFor, awayGoalsAgainst, awayBtts, awayFailedToScore, awayCleanSheets) }
	} as never;
}

function variation(id: string) {
	const result = bttnsStrategyVariations.find((item) => item.id === id);
	if (!result) throw new Error(`Missing test variation: ${id}`);
	return result;
}

describe('matchesBttnsStrategyVariation', () => {
	it('matches when either team has a low relevant-venue BTNTS rate', () => {
		expect(matchesBttnsStrategyVariation(snapshot({ homeBtts: 20 }), variation('bttns-btts20-last5'))).toBe(true);
		expect(matchesBttnsStrategyVariation(snapshot({ homeBtts: 40, awayBtts: 40 }), variation('bttns-btts20-last5'))).toBe(false);
	});

	it('matches low scoring and low conceding variations independently', () => {
		expect(matchesBttnsStrategyVariation(snapshot({ awayGoalsFor: 0.7 }), variation('bttns-scoring0.7-last5'))).toBe(true);
		expect(matchesBttnsStrategyVariation(snapshot({ homeGoalsAgainst: 0.7 }), variation('bttns-defensive0.7-last5'))).toBe(true);
	});

	it('matches when either team failed to score in enough relevant-venue matches', () => {
		const strategy = variation('bttns-failedToScore60-last5');
		expect(matchesBttnsStrategyVariation(snapshot({ homeFailedToScore: 3 }), strategy)).toBe(true);
		expect(matchesBttnsStrategyVariation(snapshot({ homeFailedToScore: 2, awayFailedToScore: 2 }), strategy)).toBe(false);
	});

	it('matches when either team kept enough relevant-venue clean sheets', () => {
		const strategy = variation('bttns-cleanSheets60-last5');
		expect(matchesBttnsStrategyVariation(snapshot({ awayCleanSheets: 3 }), strategy)).toBe(true);
		expect(matchesBttnsStrategyVariation(snapshot({ homeCleanSheets: 2, awayCleanSheets: 2 }), strategy)).toBe(false);
	});

	it('requires both conditions for the combined strategy', () => {
		const combined = variation('bttns-score0.7-concede0.7-last5');
		expect(matchesBttnsStrategyVariation(snapshot({ homeGoalsFor: 0.7, awayGoalsAgainst: 0.7 }), combined)).toBe(true);
		expect(matchesBttnsStrategyVariation(snapshot({ homeGoalsFor: 0.7, awayGoalsAgainst: 1 }), combined)).toBe(false);
	});
});
