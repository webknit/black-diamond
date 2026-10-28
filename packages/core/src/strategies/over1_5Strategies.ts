import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

type TeamMode = 'bothTeams' | 'atLeastOneTeam';

export type Over1_5StrategyVariation = {
	id: string;
	title: string;
	description: string;
	scoringThreshold?: number;
	defensiveThreshold?: number;
	scoringMode?: TeamMode;
	defensiveMode?: TeamMode;
	over1_5RateThreshold?: number;
};

const thresholds = [0.5, 0.7, 0.9, 1.1] as const;

function modeLabel(mode: TeamMode) {
	return mode === 'bothTeams' ? 'Both teams' : 'At least one team';
}

function createVariation(
	scoringThreshold: number | undefined,
	scoringMode: TeamMode | undefined,
	defensiveThreshold: number | undefined,
	defensiveMode: TeamMode | undefined
): Over1_5StrategyVariation {
	const requirements = [
		scoringThreshold === undefined || scoringMode === undefined
			? null
			: `${modeLabel(scoringMode)}: score >= ${scoringThreshold}`,
		defensiveThreshold === undefined || defensiveMode === undefined
			? null
			: `${modeLabel(defensiveMode)}: concede >= ${defensiveThreshold}`
	].filter((requirement): requirement is string => requirement !== null);
	return {
		id: `over1_5-${[
			scoringThreshold === undefined ? null : `score${scoringThreshold}-${scoringMode}`,
			defensiveThreshold === undefined ? null : `concede${defensiveThreshold}-${defensiveMode}`
		]
			.filter(Boolean)
			.join('-')}`,
		title: requirements.join(' · '),
		description: `Last 5 relevant-venue matches must meet: ${requirements.join('; ')}.`,
		scoringThreshold,
		scoringMode,
		defensiveThreshold,
		defensiveMode
	};
}

export const over1_5StrategyVariations: Over1_5StrategyVariation[] = [
	...([40, 60, 80] as const).map((threshold) => ({
		id: `over1_5-rate${threshold}-last5`,
		title: `Both teams: last 5 Over 1.5 >= ${threshold}%`,
		description: `Each team had Over 1.5 goals in at least ${threshold}% of its previous 5 relevant-venue matches.`,
		over1_5RateThreshold: threshold
	})),
	...thresholds.flatMap((threshold) =>
		(['bothTeams', 'atLeastOneTeam'] as const).map((mode) =>
			createVariation(threshold, mode, undefined, undefined)
		)
	),
	...thresholds.flatMap((threshold) =>
		(['bothTeams', 'atLeastOneTeam'] as const).map((mode) =>
			createVariation(undefined, undefined, threshold, mode)
		)
	),
	...thresholds.flatMap((threshold) =>
		(['atLeastOneTeam', 'bothTeams'] as const).map((defensiveMode) =>
			createVariation(threshold, 'bothTeams', threshold, defensiveMode)
		)
	)
];

function average(goals: number, played: number) {
	return played === 0 ? null : goals / played;
}

function meets(values: Array<number | null>, threshold: number, mode: TeamMode) {
	if (values.some((value) => value === null)) return false;
	return mode === 'bothTeams'
		? values.every((value) => value! >= threshold)
		: values.some((value) => value! >= threshold);
}

export function matchesOver1_5StrategyVariation(
	snapshot: FixtureStatsSnapshot,
	variation: Over1_5StrategyVariation
) {
	const home = snapshot.home.last5Venue;
	const away = snapshot.away.last5Venue;
	if (home.played !== 5 || away.played !== 5) return false;
	if (
		variation.over1_5RateThreshold !== undefined &&
		(home.summary.over1_5.percentage < variation.over1_5RateThreshold ||
			away.summary.over1_5.percentage < variation.over1_5RateThreshold)
	) return false;
	if (
		variation.scoringThreshold !== undefined &&
		!meets([average(home.goalsFor, home.played), average(away.goalsFor, away.played)], variation.scoringThreshold, variation.scoringMode!)
	) return false;
	if (
		variation.defensiveThreshold !== undefined &&
		!meets([average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)], variation.defensiveThreshold, variation.defensiveMode!)
	) return false;
	return true;
}
