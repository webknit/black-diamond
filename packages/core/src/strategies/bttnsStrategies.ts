import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

type LowMetric = 'btts' | 'scoring' | 'defensive' | 'failedToScore' | 'combined';

export type BttnsStrategyVariation = {
	id: string;
	title: string;
	description: string;
	metric: LowMetric;
	threshold: number;
	bttsRateSample?: 'venue' | 'overall';
};

const lowGoalThresholds = [0.5, 0.7, 0.9] as const;

function createVariation(
	metric: Exclude<LowMetric, 'combined'>,
	threshold: number,
	bttsRateSample: NonNullable<BttnsStrategyVariation['bttsRateSample']> = 'venue'
): BttnsStrategyVariation {
	const metricDetails = {
		btts: {
			title:
				bttsRateSample === 'venue'
					? `At least one team: last 5 H/A BTTS <= ${threshold}%`
					: `At least one team: overall last 5 BTTS <= ${threshold}%`,
			description:
				bttsRateSample === 'venue'
					? `At least one team recorded BTTS in no more than ${threshold}% of its previous 5 relevant-venue matches.`
					: `At least one team recorded BTTS in no more than ${threshold}% of its previous 5 matches, regardless of venue.`
		},
		scoring: {
			title: `At least one team: score <= ${threshold}`,
			description: `At least one team scored no more than ${threshold} goals per previous relevant-venue match across its last 5.`
		},
		defensive: {
			title: `At least one team: concede <= ${threshold}`,
			description: `At least one team conceded no more than ${threshold} goals per previous relevant-venue match across its last 5.`
		},
		failedToScore: {
			title: `At least one team: failed to score in >= ${threshold}% of last 5`,
			description: `At least one team failed to score in at least ${threshold}% of its previous 5 relevant-venue matches.`
		}
	} as const;

	return {
		id: `bttns-${metric}${threshold}-${metric === 'btts' && bttsRateSample === 'overall' ? 'overall-last5' : 'last5'}`,
		...metricDetails[metric],
		metric,
		threshold,
		...(metric === 'btts' ? { bttsRateSample } : {})
	};
}

export const bttnsStrategyVariations: BttnsStrategyVariation[] = [
	...([20, 40] as const).flatMap((threshold) => [
		createVariation('btts', threshold, 'venue'),
		createVariation('btts', threshold, 'overall')
	]),
	...lowGoalThresholds.map((threshold) => createVariation('scoring', threshold)),
	...lowGoalThresholds.map((threshold) => createVariation('defensive', threshold)),
	...([40, 60, 80] as const).map((threshold) => createVariation('failedToScore', threshold)),
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

function atLeastOneAtOrAbove(values: Array<number | null>, threshold: number) {
	return values.some((value) => value !== null && value >= threshold);
}

function failedToScoreRate(record: FixtureStatsSnapshot['home']['last5Venue']) {
	// Older saved snapshots used the short `fts` key. Retaining that fallback means
	// the strategy can assess the existing history as well as newly synced data.
	const legacyRecord = record as typeof record & { fts?: number };
	const failedToScore = record.failedToScore ?? legacyRecord.fts ?? 0;
	return record.played === 0 ? null : (failedToScore / record.played) * 100;
}

export function matchesBttnsStrategyVariation(
	snapshot: FixtureStatsSnapshot,
	variation: BttnsStrategyVariation
) {
	const home = snapshot.home.last5Venue;
	const away = snapshot.away.last5Venue;
	if (home.played !== 5 || away.played !== 5) return false;

	const bttsRates =
		variation.bttsRateSample === 'overall'
			? [snapshot.home.last5.btts.percentage, snapshot.away.last5.btts.percentage]
			: [home.summary.btts.percentage, away.summary.btts.percentage];
	const scoringAverages = [average(home.goalsFor, home.played), average(away.goalsFor, away.played)];
	const defensiveAverages = [
		average(home.goalsAgainst, home.played),
		average(away.goalsAgainst, away.played)
	];
	const failedToScoreRates = [failedToScoreRate(home), failedToScoreRate(away)];

	if (variation.metric === 'btts') {
		if (variation.bttsRateSample === 'overall' && (snapshot.home.last5.played !== 5 || snapshot.away.last5.played !== 5)) {
			return false;
		}
		return atLeastOneAtOrBelow(bttsRates, variation.threshold);
	}
	if (variation.metric === 'scoring') return atLeastOneAtOrBelow(scoringAverages, variation.threshold);
	if (variation.metric === 'defensive') return atLeastOneAtOrBelow(defensiveAverages, variation.threshold);
	if (variation.metric === 'failedToScore') {
		return atLeastOneAtOrAbove(failedToScoreRates, variation.threshold);
	}

	return (
		atLeastOneAtOrBelow(scoringAverages, variation.threshold) &&
		atLeastOneAtOrBelow(defensiveAverages, variation.threshold)
	);
}
