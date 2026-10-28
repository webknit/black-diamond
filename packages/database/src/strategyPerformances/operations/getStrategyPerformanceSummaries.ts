import type { StrategyPerformanceSummary } from '@black-diamond/core/strategyPerformance';
import { getDatabase } from '../../mongodb.js';

export async function getStrategyPerformanceSummaries(
	strategyIds: readonly string[],
	oddsRangeId: string | null = null
): Promise<StrategyPerformanceSummary[]> {
	const database = await getDatabase();
	const projection = oddsRangeId === null
		? { strategyId: 1, seasonPerformance: 1, weeks: 1 }
		: {
				strategyId: 1,
				weeks: 1,
				oddsBands: 1
			};

	return database
		.collection<StrategyPerformanceSummary>('strategyPerformanceSummaries')
		.find({ strategyVersion: 1, strategyId: { $in: strategyIds } }, { projection })
		.toArray();
}
