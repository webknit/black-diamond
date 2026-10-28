import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

export type Over2_5RateStrategyVariation = {
	id: string;
	title: string;
	description: string;
	over2_5RateThreshold: number;
};

export const over2_5RateStrategyVariations: Over2_5RateStrategyVariation[] = [40, 60, 80].map(
	(threshold) => ({
		id: `over2_5-rate${threshold}-last5`,
		title: `Both teams: last 5 Over 2.5 >= ${threshold}%`,
		description: `Each team had Over 2.5 goals in at least ${threshold}% of its previous 5 matches.`,
		over2_5RateThreshold: threshold
	})
);

export function matchesOver2_5RateStrategyVariation(
	snapshot: FixtureStatsSnapshot,
	variation: Over2_5RateStrategyVariation
) {
	return (
		snapshot.home.last5.over2_5.percentage >= variation.over2_5RateThreshold &&
		snapshot.away.last5.over2_5.percentage >= variation.over2_5RateThreshold
	);
}
