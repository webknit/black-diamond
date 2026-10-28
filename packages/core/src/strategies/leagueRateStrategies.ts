import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

export type LeagueRateMarket = 'over2_5' | 'over1_5' | 'btts' | 'bttns';
type Comparison = 'atLeast' | 'atMost';
type TeamMode = 'bothTeams' | 'atLeastOneTeam';

export type LeagueRateContext = {
	fixturesPlayed: number;
	over1_5Percentage: number;
	over2_5Percentage: number;
	bttsPercentage: number;
};

export type LeagueRateStrategyVariation = {
	id: string;
	title: string;
	description: string;
	market: LeagueRateMarket;
	leagueMetric: 'over1_5Percentage' | 'over2_5Percentage' | 'bttsPercentage';
	leagueThreshold: number;
	leagueComparison: Comparison;
	scoringThreshold?: number;
	defensiveThreshold?: number;
	teamMode?: TeamMode;
};

function teamLabel(mode: TeamMode) {
	return mode === 'bothTeams' ? 'Both teams' : 'At least one team';
}

function leagueLabel(market: LeagueRateMarket, comparison: Comparison, threshold: number) {
	const label = market === 'over2_5' ? 'League O2.5' : market === 'over1_5' ? 'League O1.5' : 'League BTTS';
	return `${label} ${comparison === 'atLeast' ? '>=' : '<='} ${threshold}%`;
}

function createVariations(
	market: LeagueRateMarket,
	leagueThresholds: readonly number[],
	teamThresholds: readonly number[],
	comparison: Comparison,
	leagueMetric: LeagueRateStrategyVariation['leagueMetric'],
	teamMode: TeamMode
): LeagueRateStrategyVariation[] {
	const lowMarket = market === 'bttns';
	const operator = lowMarket ? '<=' : '>=';
	const teamRequirement = (metric: 'score' | 'concede', threshold: number) =>
		`${teamLabel(teamMode)}: ${metric} ${operator} ${threshold}`;
	const create = (
		leagueThreshold: number,
		scoringThreshold?: number,
		defensiveThreshold?: number
	): LeagueRateStrategyVariation => {
		const requirements = [
			leagueLabel(market, comparison, leagueThreshold),
			scoringThreshold === undefined ? null : teamRequirement('score', scoringThreshold),
			defensiveThreshold === undefined ? null : teamRequirement('concede', defensiveThreshold)
		].filter((value): value is string => value !== null);
		return {
			id: `${market}-league-${leagueThreshold}-${comparison}-${[
				scoringThreshold === undefined ? null : `score${scoringThreshold}`,
				defensiveThreshold === undefined ? null : `concede${defensiveThreshold}`
			].filter(Boolean).join('-') || 'base'}`,
			title: requirements.join(' · '),
			description: `The league's pre-match season rate and the teams' previous 5 relevant-venue matches must meet: ${requirements.join('; ')}.`,
			market,
			leagueMetric,
			leagueThreshold,
			leagueComparison: comparison,
			scoringThreshold,
			defensiveThreshold,
			teamMode
		};
	};

	return leagueThresholds.flatMap((leagueThreshold) => [
		create(leagueThreshold),
		...teamThresholds.map((threshold) => create(leagueThreshold, threshold)),
		...teamThresholds.map((threshold) => create(leagueThreshold, undefined, threshold)),
		...teamThresholds.map((threshold) => create(leagueThreshold, threshold, threshold))
	]);
}

export const leagueRateStrategyVariations = [
	...createVariations('over2_5', [40, 50, 60], [1.3, 1.5, 1.7], 'atLeast', 'over2_5Percentage', 'bothTeams'),
	...createVariations('over1_5', [60, 70, 80], [0.5, 0.7, 0.9, 1.1], 'atLeast', 'over1_5Percentage', 'bothTeams'),
	...createVariations('btts', [40, 50, 60], [0.9, 1.1, 1.3], 'atLeast', 'bttsPercentage', 'bothTeams'),
	...createVariations('bttns', [60, 50, 40], [0.5, 0.7, 0.9], 'atMost', 'bttsPercentage', 'atLeastOneTeam')
];

function average(goals: number, played: number) {
	return played === 0 ? null : goals / played;
}

function teamCondition(values: Array<number | null>, threshold: number, mode: TeamMode, comparison: Comparison) {
	if (values.some((value) => value === null)) return false;
	return mode === 'bothTeams'
		? values.every((value) => comparison === 'atLeast' ? value! >= threshold : value! <= threshold)
		: values.some((value) => comparison === 'atLeast' ? value! >= threshold : value! <= threshold);
}

export function matchesLeagueRateStrategyVariation(
	snapshot: FixtureStatsSnapshot,
	league: LeagueRateContext,
	variation: LeagueRateStrategyVariation
) {
	if (league.fixturesPlayed < 5) return false;
	const leagueRate = league[variation.leagueMetric];
	if (variation.leagueComparison === 'atLeast' ? leagueRate < variation.leagueThreshold : leagueRate > variation.leagueThreshold) return false;

	const home = snapshot.home.last5Venue;
	const away = snapshot.away.last5Venue;
	if (home.played !== 5 || away.played !== 5) return false;
	const comparison: Comparison = variation.market === 'bttns' ? 'atMost' : 'atLeast';
	const mode = variation.teamMode!;
	if (variation.scoringThreshold !== undefined && !teamCondition([average(home.goalsFor, home.played), average(away.goalsFor, away.played)], variation.scoringThreshold, mode, comparison)) return false;
	if (variation.defensiveThreshold !== undefined && !teamCondition([average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)], variation.defensiveThreshold, mode, comparison)) return false;
	return true;
}
