import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

export type BttsStrategyVariation = {
	id: string;
	title: string;
	description: string;
	scoringThreshold?: number;
	defensiveThreshold?: number;
	sample: 'last5' | 'season';
};

const thresholds = [0.7, 0.9, 1, 1.3] as const;

function createVariation(
	scoringThreshold: number | undefined,
	defensiveThreshold: number | undefined,
	sample: BttsStrategyVariation['sample']
): BttsStrategyVariation {
	const requirements = [
		scoringThreshold === undefined ? null : `Both teams: score >= ${scoringThreshold}`,
		defensiveThreshold === undefined ? null : `Both teams: concede >= ${defensiveThreshold}`
	].filter((requirement): requirement is string => requirement !== null);

	return {
		id: `btts-${[
			scoringThreshold === undefined ? null : `score${scoringThreshold}`,
			defensiveThreshold === undefined ? null : `concede${defensiveThreshold}`,
			sample
		]
			.filter(Boolean)
			.join('-')}`,
		title: sample === 'last5' ? requirements.join(' · ') : `${requirements.join(' · ')} · season`,
		description: `${sample === 'last5' ? 'Last 5' : 'Season'} relevant-venue matches must meet: ${requirements.join('; ')}.`,
		scoringThreshold,
		defensiveThreshold,
		sample
	};
}

export const bttsStrategyVariations: BttsStrategyVariation[] = [
	...thresholds.map((threshold) => createVariation(threshold, undefined, 'last5')),
	...thresholds.map((threshold) => createVariation(undefined, threshold, 'last5')),
	...thresholds.flatMap((scoringThreshold) =>
		thresholds.map((defensiveThreshold) =>
			createVariation(scoringThreshold, defensiveThreshold, 'last5')
		)
	),
	...thresholds.map((threshold) => createVariation(threshold, undefined, 'season')),
	...thresholds.map((threshold) => createVariation(undefined, threshold, 'season')),
	...thresholds.flatMap((scoringThreshold) =>
		thresholds.map((defensiveThreshold) =>
			createVariation(scoringThreshold, defensiveThreshold, 'season')
		)
	)
];

function average(goals: number, played: number) {
	return played === 0 ? null : goals / played;
}

function bothMeetThreshold(values: Array<number | null>, threshold: number) {
	return values.every((value) => value !== null && value >= threshold);
}

export function matchesBttsStrategyVariation(
	snapshot: FixtureStatsSnapshot,
	variation: BttsStrategyVariation
) {
	const home = variation.sample === 'last5' ? snapshot.home.last5Venue : snapshot.home.fixtures.home;
	const away = variation.sample === 'last5' ? snapshot.away.last5Venue : snapshot.away.fixtures.away;
	if (!home || !away) return false;

	if (
		variation.scoringThreshold !== undefined &&
		!bothMeetThreshold(
			[average(home.goalsFor, home.played), average(away.goalsFor, away.played)],
			variation.scoringThreshold
		)
	) {
		return false;
	}

	if (
		variation.defensiveThreshold !== undefined &&
		!bothMeetThreshold(
			[average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)],
			variation.defensiveThreshold
		)
	) {
		return false;
	}

	return true;
}
