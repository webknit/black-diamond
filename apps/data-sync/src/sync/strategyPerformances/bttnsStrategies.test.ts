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
	awayBtts = 60
}: {
	homeGoalsFor?: number;
	awayGoalsFor?: number;
	homeGoalsAgainst?: number;
	awayGoalsAgainst?: number;
	homeBtts?: number;
	awayBtts?: number;
} = {}) {
	const record = (goalsFor: number, goalsAgainst: number, btts: number) => ({
		played: 5,
		goalsFor: goalsFor * 5,
		goalsAgainst: goalsAgainst * 5,
		summary: { btts: { count: (btts / 100) * 5, percentage: btts } }
	});

	return {
		home: { last5Venue: record(homeGoalsFor, homeGoalsAgainst, homeBtts) },
		away: { last5Venue: record(awayGoalsFor, awayGoalsAgainst, awayBtts) }
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

	it('requires both conditions for the combined strategy', () => {
		const combined = variation('bttns-score0.7-concede0.7-last5');
		expect(matchesBttnsStrategyVariation(snapshot({ homeGoalsFor: 0.7, awayGoalsAgainst: 0.7 }), combined)).toBe(true);
		expect(matchesBttnsStrategyVariation(snapshot({ homeGoalsFor: 0.7, awayGoalsAgainst: 1 }), combined)).toBe(false);
	});
});
