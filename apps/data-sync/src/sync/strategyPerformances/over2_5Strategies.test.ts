import { describe, expect, it } from 'vitest';
import { getOver2_5ReferenceOdd, matchesOver2_5RateStrategyVariation, matchesTeamFilterVariation, over2_5RateStrategyVariations, teamFilterVariations } from '@black-diamond/core/strategies';

function snapshot(homeRate = 60, awayRate = 60, homeGoals = 1.5, awayGoals = 1.5) {
	const venue = (goals: number, rate: number) => ({ played: 5, goalsFor: goals * 5, goalsAgainst: goals * 5, summary: { over2_5: { percentage: rate } } });
	return { home: { last5: { over2_5: { percentage: homeRate } }, last5Venue: venue(homeGoals, homeRate), fixtures: { home: venue(homeGoals, homeRate) } }, away: { last5: { over2_5: { percentage: awayRate } }, last5Venue: venue(awayGoals, awayRate), fixtures: { away: venue(awayGoals, awayRate) } } } as never;
}

describe('Over 2.5 strategies', () => {
	it('requires both teams to meet the stated last-five rate threshold', () => {
		const strategy = over2_5RateStrategyVariations.find((item) => item.id === 'over2_5-rate60-last5')!;
		expect(matchesOver2_5RateStrategyVariation(snapshot(60, 60), strategy)).toBe(true);
		expect(matchesOver2_5RateStrategyVariation(snapshot(60, 40), strategy)).toBe(false);
	});
	it('applies either-team and both-team scoring filters differently', () => {
		const either = teamFilterVariations.find((item) => item.id === 'score1.5-eitherTeam-last5')!;
		const both = teamFilterVariations.find((item) => item.id === 'score1.5-bothTeams-last5')!;
		expect(matchesTeamFilterVariation(snapshot(60, 60, 1.5, 1.2), either)).toBe(false);
		expect(matchesTeamFilterVariation(snapshot(60, 60, 1.5, 1.2), both)).toBe(true);
	});
	it('uses only a valid stored Over 2.5 price', () => {
		expect(getOver2_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Over 2.5', odd: '1.80' }] }])).toBe(1.8);
		expect(getOver2_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Over 2.5', odd: '—' }] }])).toBeNull();
	});
});
