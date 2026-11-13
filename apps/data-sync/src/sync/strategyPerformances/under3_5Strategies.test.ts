import { describe, expect, it } from 'vitest';
import { getUnder3_5ReferenceOdd, matchesUnder3_5StrategyVariation, under3_5StrategyVariations } from '@black-diamond/core/strategies';
import { addStrategyResult } from './syncStrategyPerformances';

function snapshot(homeRate = 80, awayRate = 80, homeGoals = 0.5, awayGoals = 0.5, homeConceded = 0.5, awayConceded = 0.5) {
	const venue = (goalsFor: number, goalsAgainst: number, rate: number) => ({ played: 5, goalsFor: goalsFor * 5, goalsAgainst: goalsAgainst * 5, summary: { under3_5: { percentage: rate } } });
	return { home: { last5Venue: venue(homeGoals, homeConceded, homeRate) }, away: { last5Venue: venue(awayGoals, awayConceded, awayRate) } } as never;
}

describe('Under 3.5 strategies', () => {
	it('has unique variation ids and includes the higher 1.7 filters', () => {
		const ids = under3_5StrategyVariations.map((strategy) => strategy.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toContain('under3_5-score1.7-bothTeams');
		expect(ids).toContain('under3_5-concede1.7-bothTeams');
	});
	it.each(under3_5StrategyVariations)('qualifies a fixture at the intended $id boundary', (strategy) => {
		expect(matchesUnder3_5StrategyVariation(snapshot(), strategy)).toBe(true);
	});
	it('requires both teams to meet the stated Under 3.5 rate threshold', () => {
		const strategy = under3_5StrategyVariations.find((item) => item.id === 'under3_5-rate60-last5')!;
		expect(matchesUnder3_5StrategyVariation(snapshot(60, 60), strategy)).toBe(true);
		expect(matchesUnder3_5StrategyVariation(snapshot(60, 40), strategy)).toBe(false);
	});
	it('distinguishes either-team and both-team high-range scoring filters', () => {
		const either = under3_5StrategyVariations.find((item) => item.id === 'under3_5-score1.7-atLeastOneTeam')!;
		const both = under3_5StrategyVariations.find((item) => item.id === 'under3_5-score1.7-bothTeams')!;
		expect(matchesUnder3_5StrategyVariation(snapshot(80, 80, 1.7, 1.8), either)).toBe(true);
		expect(matchesUnder3_5StrategyVariation(snapshot(80, 80, 1.7, 1.8), both)).toBe(false);
	});
	it('extracts valid Under 3.5 odds and calculates a controlled result', () => {
		expect(getUnder3_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Under 3.5', odd: '1.30' }] }])).toBe(1.3);
		expect(getUnder3_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Under 3.5', odd: '—' }] }])).toBeNull();
		const totals = { bets: 0, wins: 0, losses: 0, profit: 0 };
		addStrategyResult(totals, true, 1.5); addStrategyResult(totals, false, 1.5);
		expect(totals).toEqual({ bets: 2, wins: 1, losses: 1, profit: -0.5 });
	});
});
