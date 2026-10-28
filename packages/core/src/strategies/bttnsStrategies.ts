import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

type LowMetric = 'btts' | 'scoring' | 'defensive' | 'combined';

export type BttnsStrategyVariation = {
	id: string;
	title: string;
	description: string;
	metric: LowMetric;
	threshold: number;
};

const lowGoalThresholds = [0.5, 0.7, 0.9] as const;

function createVariation(metric: Exclude<LowMetric, 'combined'>, threshold: number): BttnsStrategyVariation {
	const metricDetails = {
		btts: {
			title: `At least one team: last 5 BTTS <= ${threshold}%`,
			description: `At least one team recorded BTTS in no more than ${threshold}% of its previous 5 relevant-venue matches.`
		},
		scoring: {
			title: `At least one team: score <= ${threshold}`,
			description: `At least one team scored no more than ${threshold} goals per previous relevant-venue match across its last 5.`
		},
		defensive: {
			title: `At least one team: concede <= ${threshold}`,
			description: `At least one team conceded no more than ${threshold} goals per previous relevant-venue match across its last 5.`
		}
	} as const;

	return {
		id: `bttns-${metric}${threshold}-last5`,
		...metricDetails[metric],
		metric,
		threshold
	};
}

export const bttnsStrategyVariations: BttnsStrategyVariation[] = [
	...([20, 40] as const).map((threshold) => createVariation('btts', threshold)),
	...lowGoalThresholds.map((threshold) => createVariation('scoring', threshold)),
	...lowGoalThresholds.map((threshold) => createVariation('defensive', threshold)),
	{
		id: 'bttns-score0.7-concede0.7-last5',
		title: 'At least one team: score <= 0.7 · At least one team: concede <= 0.7',
		description:
			'Across the previous 5 relevant-venue matches, at least one team must meet each low-scoring and low-conceding condition.',
		metric: 'combined',
		threshold: 0.7
	}
];

function average(goals: number, played: number) {
	return played === 0 ? null : goals / played;
}

function atLeastOneAtOrBelow(values: Array<number | null>, threshold: number) {
	return values.some((value) => value !== null && value <= threshold);
}

export function matchesBttnsStrategyVariation(
	snapshot: FixtureStatsSnapshot,
	variation: BttnsStrategyVariation
) {
	const home = snapshot.home.last5Venue;
	const away = snapshot.away.last5Venue;
	if (home.played !== 5 || away.played !== 5) return false;

	const bttsRates = [home.summary.btts.percentage, away.summary.btts.percentage];
	const scoringAverages = [average(home.goalsFor, home.played), average(away.goalsFor, away.played)];
	const defensiveAverages = [
		average(home.goalsAgainst, home.played),
		average(away.goalsAgainst, away.played)
	];

	if (variation.metric === 'btts') return atLeastOneAtOrBelow(bttsRates, variation.threshold);
	if (variation.metric === 'scoring') return atLeastOneAtOrBelow(scoringAverages, variation.threshold);
	if (variation.metric === 'defensive') return atLeastOneAtOrBelow(defensiveAverages, variation.threshold);

	return (
		atLeastOneAtOrBelow(scoringAverages, variation.threshold) &&
		atLeastOneAtOrBelow(defensiveAverages, variation.threshold)
	);
}
