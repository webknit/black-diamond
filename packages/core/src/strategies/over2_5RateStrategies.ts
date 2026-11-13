import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

export type Over2_5RateStrategyVariation = {
	id: string;
	title: string;
	description: string;
	over2_5RateThreshold: number;
	rateSample?: 'allLast5' | 'last5Venue' | 'last3Venue';
};

const samples = [
	{ id: 'all-last5', title: 'All last 5', description: 'each team’s previous 5 matches in all venues', rateSample: 'allLast5' as const },
	{ id: 'ha-last5', title: 'Last 5 H/A', description: 'the home team’s previous 5 home matches and away team’s previous 5 away matches', rateSample: 'last5Venue' as const },
	{ id: 'ha-last3', title: 'Last 3 H/A', description: 'the home team’s previous 3 home matches and away team’s previous 3 away matches', rateSample: 'last3Venue' as const }
];

export const over2_5RateStrategyVariations: Over2_5RateStrategyVariation[] = [40, 60, 80].flatMap((threshold) => samples.map((sample) => ({
	id: sample.id === 'all-last5' ? `over2_5-rate${threshold}-last5` : `over2_5-rate${threshold}-${sample.id}`,
	title: `Both teams: ${sample.title} Over 2.5 >= ${threshold}%`,
	description: `Each team had Over 2.5 goals in at least ${threshold}% of ${sample.description}.`,
	over2_5RateThreshold: threshold,
	rateSample: sample.rateSample
})));

export function matchesOver2_5RateStrategyVariation(
	snapshot: FixtureStatsSnapshot,
	variation: Over2_5RateStrategyVariation
) {
	const sample = variation.rateSample ?? 'allLast5';
	if (sample === 'allLast5') return snapshot.home.last5.over2_5.percentage >= variation.over2_5RateThreshold && snapshot.away.last5.over2_5.percentage >= variation.over2_5RateThreshold;
	const home = snapshot.home[sample]; const away = snapshot.away[sample];
	if (!home || !away) return false;
	if (home.played < (sample === 'last3Venue' ? 3 : 5) || away.played < (sample === 'last3Venue' ? 3 : 5)) return false;
	return home.summary.over2_5.percentage >= variation.over2_5RateThreshold && away.summary.over2_5.percentage >= variation.over2_5RateThreshold;
}
