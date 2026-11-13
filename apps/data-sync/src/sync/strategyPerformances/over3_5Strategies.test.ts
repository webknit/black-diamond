import { describe, expect, it } from 'vitest';
import { getBettableMinimumOdds, getBettableOddsBandIds, getOver3_5ReferenceOdd, matchesOver3_5StrategyVariation, over3_5StrategyVariations } from '@black-diamond/core/strategies';

const snapshot = (homeRate = 100, awayRate = 100, homeGoals = 3, awayGoals = 3) => ({
	home: { last5Venue: { played: 5, goalsFor: homeGoals * 5, goalsAgainst: homeGoals * 5, summary: { over3_5: { percentage: homeRate } } } },
	away: { last5Venue: { played: 5, goalsFor: awayGoals * 5, goalsAgainst: awayGoals * 5, summary: { over3_5: { percentage: awayRate } } } }
}) as never;

describe('Over 3.5 strategies', () => {
	it('uses the Over 3.5 pre-match price', () => {
		expect(getOver3_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Over 3.5', odd: '2.2' }] }])).toBe(2.2);
	});

	it('treats only odds from 2.20 upwards as bettable', () => {
		expect(getBettableMinimumOdds('over3_5')).toBe(2.2);
		expect(getBettableOddsBandIds('over3_5')).toEqual(['2.20-2.49', '2.50-2.99', '3.00+']);
	});

	it.each(over3_5StrategyVariations)('qualifies a high-scoring fixture for $id', (strategy) => {
		expect(matchesOver3_5StrategyVariation(snapshot(), strategy)).toBe(true);
	});

	it('uses meaningful scoring, conceding, and total-goals thresholds', () => {
		expect(over3_5StrategyVariations).toHaveLength(58);
		expect(over3_5StrategyVariations.map((strategy) => strategy.scoringThreshold).filter(Boolean)).toEqual(expect.arrayContaining([1.5, 1.7, 2, 2.25, 2.5]));
		expect(over3_5StrategyVariations.map((strategy) => strategy.defensiveThreshold).filter(Boolean)).toEqual(expect.arrayContaining([1.25, 1.5, 1.75]));
		expect(over3_5StrategyVariations.map((strategy) => strategy.totalGoalsThreshold).filter(Boolean)).toEqual(expect.arrayContaining([2.5, 2.75, 3]));
	});

	it('requires both teams to meet an Over 3.5 hit-rate threshold', () => {
		const strategy = over3_5StrategyVariations.find((item) => item.id === 'over3_5-rate60-last5')!;
		expect(matchesOver3_5StrategyVariation(snapshot(60, 60), strategy)).toBe(true);
		expect(matchesOver3_5StrategyVariation(snapshot(60, 40), strategy)).toBe(false);
	});
});
