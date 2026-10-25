import type { FixtureStatsSnapshot } from '@black-diamond/core/fixtureStatsSnapshot';

const thresholds = [1.3, 1.5, 1.7] as const;

type ExclusionMode = 'eitherTeam' | 'bothTeams';

export type TeamFilterVariation = {
	id: string;
	title: string;
	description: string;
	scoringThreshold?: number;
	defensiveThreshold?: number;
	exclusionMode: ExclusionMode;
};

function modeLabel(exclusionMode: ExclusionMode) {
	return exclusionMode === 'eitherTeam' ? 'Reject if either team' : 'Reject if both teams';
}

function filterDescription(
	scoringThreshold: number | undefined,
	defensiveThreshold: number | undefined,
	exclusionMode: ExclusionMode
) {
	const filters = [
		scoringThreshold === undefined ? null : `scores below ${scoringThreshold}`,
		defensiveThreshold === undefined ? null : `concedes below ${defensiveThreshold}`
	].filter((filter): filter is string => filter !== null);

	return `${modeLabel(exclusionMode)} ${filters.join(' or ')} goals per relevant venue match.`;
}

function createVariation(
	scoringThreshold: number | undefined,
	defensiveThreshold: number | undefined,
	exclusionMode: ExclusionMode
): TeamFilterVariation {
	const filterId = [
		scoringThreshold === undefined ? null : `score${scoringThreshold}`,
		defensiveThreshold === undefined ? null : `defend${defensiveThreshold}`
	]
		.filter(Boolean)
		.join('-');

	return {
		id: `${filterId}-${exclusionMode}`,
		title: `${scoringThreshold === undefined ? '' : `Score ≥ ${scoringThreshold}`}${scoringThreshold !== undefined && defensiveThreshold !== undefined ? ' · ' : ''}${defensiveThreshold === undefined ? '' : `Concede ≥ ${defensiveThreshold}`} · ${modeLabel(exclusionMode)}`,
		description: filterDescription(scoringThreshold, defensiveThreshold, exclusionMode),
		scoringThreshold,
		defensiveThreshold,
		exclusionMode
	};
}

export const teamFilterVariations: TeamFilterVariation[] = [
	{
		id: 'noTeamFilters',
		title: 'Base · no team filters',
		description: 'Every fixture with a stored pre-match Over 2.5 price above the odds floor.',
		exclusionMode: 'eitherTeam'
	},
	...thresholds.flatMap((threshold) =>
		(['eitherTeam', 'bothTeams'] as const).map((exclusionMode) =>
			createVariation(threshold, undefined, exclusionMode)
		)
	),
	...thresholds.flatMap((threshold) =>
		(['eitherTeam', 'bothTeams'] as const).map((exclusionMode) =>
			createVariation(undefined, threshold, exclusionMode)
		)
	),
	...thresholds.flatMap((scoringThreshold) =>
		thresholds.flatMap((defensiveThreshold) =>
			(['eitherTeam', 'bothTeams'] as const).map((exclusionMode) =>
				createVariation(scoringThreshold, defensiveThreshold, exclusionMode)
			)
		)
	)
];

function average(goals: number, played: number) {
	return played === 0 ? null : goals / played;
}

function isExcluded(values: Array<number | null>, threshold: number, exclusionMode: ExclusionMode) {
	if (values.some((value) => value === null)) return true;
	const belowThreshold = values.map((value) => value! < threshold);
	return exclusionMode === 'eitherTeam' ? belowThreshold.some(Boolean) : belowThreshold.every(Boolean);
}

export function matchesTeamFilterVariation(snapshot: FixtureStatsSnapshot, variation: TeamFilterVariation) {
	const home = snapshot.home.fixtures.home;
	const away = snapshot.away.fixtures.away;
	const scoring = [average(home.goalsFor, home.played), average(away.goalsFor, away.played)];
	const defensive = [average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)];

	return !(
		(variation.scoringThreshold !== undefined &&
			isExcluded(scoring, variation.scoringThreshold, variation.exclusionMode)) ||
		(variation.defensiveThreshold !== undefined &&
			isExcluded(defensive, variation.defensiveThreshold, variation.exclusionMode))
	);
}
