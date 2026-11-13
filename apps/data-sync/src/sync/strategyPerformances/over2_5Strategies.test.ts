import { describe, expect, it } from 'vitest';
import { getOver2_5ReferenceOdd, leagueRateStrategyVariations, matchesLeagueRateStrategyVariation, matchesOver2_5RateStrategyVariation, matchesTeamFilterVariation, over2_5RateStrategyVariations, teamFilterVariations } from '@black-diamond/core/strategies';
import { addStrategyResult, mergeIntoSummary } from './syncStrategyPerformances';

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
	it('uses season venue figures for the season counterpart', () => {
		const strategy = teamFilterVariations.find((item) => item.id === 'defend1.5-eitherTeam-season')!;
		const fixture: any = snapshot(60, 60, 2, 2);
		fixture.home.last5Venue.goalsAgainst = 5;
		fixture.away.last5Venue.goalsAgainst = 5;
		expect(matchesTeamFilterVariation(fixture, strategy)).toBe(true);
	});
	it('uses only a valid stored Over 2.5 price', () => {
		expect(getOver2_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Over 2.5', odd: '1.80' }] }])).toBe(1.8);
		expect(getOver2_5ReferenceOdd([{ name: 'Goals Over/Under', values: [{ value: 'Over 2.5', odd: '—' }] }])).toBeNull();
	});
	it('combines multiple seasons into a league performance summary', () => {
		const summary: any = {
			seasonPerformance: { bets: 0, wins: 0, losses: 0, profit: 0 },
			weeks: {}, months: {}, oddsBands: {}, leaguePerformances: []
		};
		const performance = (season: number, bets: number, profit: number) => ({
			league: { id: 39, name: 'Premier League', country: 'England' }, season,
			seasonPerformance: { bets, wins: bets - 1, losses: 1, profit }, weeks: {}, months: {}, oddsBands: {}
		});
		mergeIntoSummary(summary, performance(2025, 20, 4) as any);
		mergeIntoSummary(summary, performance(2026, 15, 3) as any);
		expect(summary.leaguePerformances).toEqual([
			expect.objectContaining({ leagueId: 39, name: 'Premier League', country: 'England', bets: 35, wins: 33, losses: 2, profit: 7 })
		]);
	});
	it('calculates an in-memory three-fixture 60% strategy result correctly', () => {
		const strategy = over2_5RateStrategyVariations.find((item) => item.id === 'over2_5-rate60-last5')!;
		const fixtures = [
			{ snapshot: snapshot(60, 80), goals: 3, odd: 1.8 }, // qualifies and wins
			{ snapshot: snapshot(80, 60), goals: 2, odd: 2.2 }, // qualifies and loses
			{ snapshot: snapshot(60, 40), goals: 4, odd: 2.0 } // does not qualify
		];
		const totals = { bets: 0, wins: 0, losses: 0, profit: 0 };
		for (const fixture of fixtures) if (matchesOver2_5RateStrategyVariation(fixture.snapshot, strategy)) addStrategyResult(totals, fixture.goals > 2, fixture.odd);
		expect(totals).toMatchObject({ bets: 2, wins: 1, losses: 1 });
		expect(totals.profit).toBeCloseTo(-0.2, 10);
		expect(totals.profit / totals.bets * 100).toBeCloseTo(-10);
	});
	it('has unique Over 2.5 variation ids', () => {
		const ids = [...teamFilterVariations, ...over2_5RateStrategyVariations].map((strategy) => strategy.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
	it.each(over2_5RateStrategyVariations)('qualifies and rejects the boundary for $id', (strategy) => {
		expect(matchesOver2_5RateStrategyVariation(snapshot(strategy.over2_5RateThreshold, strategy.over2_5RateThreshold), strategy)).toBe(true);
		expect(matchesOver2_5RateStrategyVariation(snapshot(strategy.over2_5RateThreshold, strategy.over2_5RateThreshold - 20), strategy)).toBe(false);
	});
	it.each(teamFilterVariations)('qualifies a deliberately high-scoring fixture for $id', (strategy) => {
		expect(matchesTeamFilterVariation(snapshot(100, 100, 3, 3), strategy)).toBe(true);
	});
	it.each(leagueRateStrategyVariations.filter((strategy) => strategy.market === 'over2_5'))('qualifies and rejects the league threshold for $id', (strategy) => {
		const league = { fixturesPlayed: 10, over1_5Percentage: 90, over2_5Percentage: strategy.leagueThreshold, bttsPercentage: 90 };
		expect(matchesLeagueRateStrategyVariation(snapshot(100, 100, 3, 3), league, strategy)).toBe(true);
		expect(matchesLeagueRateStrategyVariation(snapshot(100, 100, 3, 3), { ...league, over2_5Percentage: strategy.leagueThreshold - 1 }, strategy)).toBe(false);
	});
	it('ranks two qualifying Over 2.5 variations by profit', () => {
		const rate60 = { id: 'over2_5-rate60-last5', totals: { bets: 0, wins: 0, losses: 0, profit: 0 } };
		const rate80 = { id: 'over2_5-rate80-last5', totals: { bets: 0, wins: 0, losses: 0, profit: 0 } };
		addStrategyResult(rate60.totals, true, 2.2); addStrategyResult(rate60.totals, false, 2.2);
		addStrategyResult(rate80.totals, true, 2.8); addStrategyResult(rate80.totals, false, 2.8);
		const ranked = [rate60, rate80].sort((left, right) => right.totals.profit - left.totals.profit);
		expect(ranked.map((item) => item.id)).toEqual(['over2_5-rate80-last5', 'over2_5-rate60-last5']);
		expect(ranked[0].totals.profit).toBeCloseTo(0.8, 10);
		expect(ranked[1].totals.profit).toBeCloseTo(0.2, 10);
	});
	it('matches the audited real-fixture golden set for the 60% rate strategy', () => {
		const strategy = over2_5RateStrategyVariations.find((item) => item.id === 'over2_5-rate60-last5')!;
		const fixtures = [
			{ id: 1557438, name: 'Aston Villa v Manchester City', homeRate: 60, awayRate: 60, goals: 3, odd: 1.53, won: true },
			{ id: 1557441, name: 'Crystal Palace v Newcastle', homeRate: 80, awayRate: 80, goals: 2, odd: 1.62, won: false },
			{ id: 1557442, name: 'Hull City v Brentford', homeRate: 60, awayRate: 80, goals: 2, odd: 1.67, won: false }
		];
		const totals = { bets: 0, wins: 0, losses: 0, profit: 0 };
		for (const fixture of fixtures) {
			expect(matchesOver2_5RateStrategyVariation(snapshot(fixture.homeRate, fixture.awayRate), strategy), fixture.name).toBe(true);
			expect(fixture.goals > 2, fixture.name).toBe(fixture.won);
			addStrategyResult(totals, fixture.won, fixture.odd);
		}
		expect(totals).toMatchObject({ bets: 3, wins: 1, losses: 2 });
		expect(totals.profit).toBeCloseTo(-1.47, 10);
	});
});
