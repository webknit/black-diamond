import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

export type BttsStrategyVariation = {
	id: string;
	title: string;
	description: string;
	scoringThreshold?: number;
	defensiveThreshold?: number;
	bttsRateThreshold?: number;
	bttsRateSample?: 'venue' | 'overall';
	sample: 'last5' | 'season';
};

const scoringThresholds = [0.7, 0.9, 1, 1.3, 1.5, 1.7] as const;
const defensiveThresholds = [0.7, 0.9, 1, 1.3] as const;

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

function createBttsRateVariation(
	threshold: number,
	bttsRateSample: NonNullable<BttsStrategyVariation['bttsRateSample']>
): BttsStrategyVariation {
	const venueSpecific = bttsRateSample === 'venue';
	return {
		id: `btts-rate${threshold}-${venueSpecific ? 'last5' : 'overall-last5'}`,
		title: venueSpecific
			? `Both teams: last 5 H/A BTTS >= ${threshold}%`
			: `Both teams: overall last 5 BTTS >= ${threshold}%`,
		description: venueSpecific
			? `Each team recorded BTTS in at least ${threshold}% of its previous 5 relevant-venue matches.`
			: `Each team recorded BTTS in at least ${threshold}% of its previous 5 matches, regardless of venue.`,
		bttsRateThreshold: threshold,
		bttsRateSample,
		sample: 'last5'
	};
}

export const bttsStrategyVariations: BttsStrategyVariation[] = [
	...([40, 60, 80] as const).map((threshold) => createBttsRateVariation(threshold, 'venue')),
	...([40, 60, 80] as const).map((threshold) => createBttsRateVariation(threshold, 'overall')),
	...scoringThresholds.map((threshold) => createVariation(threshold, undefined, 'last5')),
	...defensiveThresholds.map((threshold) => createVariation(undefined, threshold, 'last5')),
	...scoringThresholds.flatMap((scoringThreshold) =>
		defensiveThresholds.map((defensiveThreshold) =>
			createVariation(scoringThreshold, defensiveThreshold, 'last5')
		)
	),
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

	if (variation.bttsRateThreshold !== undefined) {
		const useVenueForm = variation.bttsRateSample !== 'overall';
		const homeForm = useVenueForm ? snapshot.home.last5Venue : snapshot.home.last5;
		const awayForm = useVenueForm ? snapshot.away.last5Venue : snapshot.away.last5;
		const homeBttsRate = useVenueForm
			? snapshot.home.last5Venue.summary.btts.percentage
			: snapshot.home.last5.btts.percentage;
		const awayBttsRate = useVenueForm
			? snapshot.away.last5Venue.summary.btts.percentage
			: snapshot.away.last5.btts.percentage;
		if (homeForm.played !== 5 || awayForm.played !== 5) return false;
		if (
			homeBttsRate < variation.bttsRateThreshold ||
			awayBttsRate < variation.bttsRateThreshold
		) {
			return false;
		}
	}

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
