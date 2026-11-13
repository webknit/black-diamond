import { describe, expect, it } from 'vitest';
import { getOver1_5ReferenceOdd, leagueRateStrategyVariations, matchesLeagueRateStrategyVariation, matchesOver1_5StrategyVariation, over1_5StrategyVariations } from '@black-diamond/core/strategies';
import { addStrategyResult } from './syncStrategyPerformances';

function snapshot(homeRate = 60, awayRate = 60, homeGoals = 1.5, awayGoals = 1.5) {
	const venue = (goals: number, rate: number) => ({ played: 5, goalsFor: goals * 5, goalsAgainst: goals * 5, summary: { over1_5: { percentage: rate } } });
	return { home: { last5Venue: venue(homeGoals, homeRate) }, away: { last5Venue: venue(awayGoals, awayRate) } } as never;
}

describe('Over 1.5 strategies', () => {
	it.each(over1_5StrategyVariations)('qualifies a deliberately high-scoring fixture for $id', (strategy) => {
		expect(matchesOver1_5StrategyVariation(snapshot(100, 100, 3, 3), strategy)).toBe(true);
	});
	it('rejects a team below a 60% last-five rate boundary', () => {
		const strategy = over1_5StrategyVariations.find((item) => item.id === 'over1_5-rate60-last5')!;
		expect(matchesOver1_5StrategyVariation(snapshot(60, 60), strategy)).toBe(true);
		expect(matchesOver1_5StrategyVariation(snapshot(60, 40), strategy)).toBe(false);
	});
	it('has unique Over 1.5 variation ids', () => {
		const ids = over1_5StrategyVariations.map((strategy) => strategy.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
	it.each(over1_5StrategyVariations.filter((strategy) => strategy.over1_5RateThreshold !== undefined))('accepts and rejects the stated rate boundary for $id', (strategy) => {
		const threshold = strategy.over1_5RateThreshold!;
		expect(matchesOver1_5StrategyVariation(snapshot(threshold, threshold), strategy)).toBe(true);
		expect(matchesOver1_5StrategyVariation(snapshot(threshold, threshold - 20), strategy)).toBe(false);
	});
	it.each(leagueRateStrategyVariations.filter((strategy) => strategy.market === 'over1_5'))('qualifies and rejects the league threshold for $id', (strategy) => {
		const league = { fixturesPlayed: 10, over1_5Percentage: strategy.leagueThreshold, over2_5Percentage: 80, bttsPercentage: 80 };
		expect(matchesLeagueRateStrategyVariation(snapshot(100, 100, 3, 3), league, strategy)).toBe(true);
		expect(matchesLeagueRateStrategyVariation(snapshot(100, 100, 3, 3), { ...league, over1_5Percentage: strategy.leagueThreshold - 1 }, strategy)).toBe(false);
	});
	it('calculates and ranks controlled in-memory results', () => {
		const first = { id: 'first', totals: { bets: 0, wins: 0, losses: 0, profit: 0 } };
		const second = { id: 'second', totals: { bets: 0, wins: 0, losses: 0, profit: 0 } };
		addStrategyResult(first.totals, true, 1.5); addStrategyResult(first.totals, false, 1.5);
		addStrategyResult(second.totals, true, 2.1); addStrategyResult(second.totals, false, 2.1);
		const ranked = [first, second].sort((a, b) => b.totals.profit - a.totals.profit);
		expect(ranked.map((item) => item.id)).toEqual(['second', 'first']);
		expect(first.totals.profit).toBeCloseTo(-0.5, 10);
		expect(second.totals.profit).toBeCloseTo(0.1, 10);
	});
	it('extracts a valid stored Over 1.5 price', () => {
		expect(getOver1_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Over 1.5', odd: '1.45' }] }])).toBe(1.45);
	});
});
