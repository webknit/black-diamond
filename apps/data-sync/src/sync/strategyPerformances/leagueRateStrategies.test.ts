import { describe, expect, it } from 'vitest';
import {
	leagueRateStrategyVariations,
	matchesLeagueRateStrategyVariation
} from '@black-diamond/core/strategies';

function snapshot({
	homeGoalsFor = 1.5,
	awayGoalsFor = 1.5,
	homeGoalsAgainst = 1.5,
	awayGoalsAgainst = 1.5
}: {
	homeGoalsFor?: number;
	awayGoalsFor?: number;
	homeGoalsAgainst?: number;
	awayGoalsAgainst?: number;
} = {}) {
	const record = (goalsFor: number, goalsAgainst: number) => ({
		played: 5,
		goalsFor: goalsFor * 5,
		goalsAgainst: goalsAgainst * 5
	});
	return {
		home: { last5Venue: record(homeGoalsFor, homeGoalsAgainst) },
		away: { last5Venue: record(awayGoalsFor, awayGoalsAgainst) }
	} as never;
}

function variation(id: string) {
	const result = leagueRateStrategyVariations.find((item) => item.id === id);
	if (!result) throw new Error(`Missing test variation: ${id}`);
	return result;
}

const highScoringLeague = {
	fixturesPlayed: 10,
	over1_5Percentage: 80,
	over2_5Percentage: 60,
	bttsPercentage: 60
};

describe('matchesLeagueRateStrategyVariation', () => {
	it('uses the pre-match league rate as a required Over 2.5 condition', () => {
		const strategy = variation('over2_5-league-60-atLeast-score1.5');
		expect(matchesLeagueRateStrategyVariation(snapshot(), highScoringLeague, strategy)).toBe(true);
		expect(matchesLeagueRateStrategyVariation(snapshot(), { ...highScoringLeague, over2_5Percentage: 50 }, strategy)).toBe(false);
	});

	it('requires each team to satisfy Over 2.5 team conditions', () => {
		const strategy = variation('over2_5-league-50-atLeast-score1.5-concede1.5');
		expect(matchesLeagueRateStrategyVariation(snapshot({ awayGoalsAgainst: 1.2 }), highScoringLeague, strategy)).toBe(false);
	});

	it('uses a low BTTS league rate and at least one low-scoring team for BTNTS', () => {
		const strategy = variation('bttns-league-50-atMost-score0.7');
		expect(matchesLeagueRateStrategyVariation(snapshot({ homeGoalsFor: 0.7 }), { ...highScoringLeague, bttsPercentage: 50 }, strategy)).toBe(true);
		expect(matchesLeagueRateStrategyVariation(snapshot({ homeGoalsFor: 0.7 }), { ...highScoringLeague, bttsPercentage: 60 }, strategy)).toBe(false);
	});

	it('does not use an unstable league sample smaller than five fixtures', () => {
		const strategy = variation('btts-league-50-atLeast-base');
		expect(matchesLeagueRateStrategyVariation(snapshot(), { ...highScoringLeague, fixturesPlayed: 4 }, strategy)).toBe(false);
	});
});
