import type { StrategyPerformanceSummary } from '@black-diamond/core/strategyPerformance';
import { getDatabase } from '../../mongodb.js';

export async function getStrategyPerformanceSummaries(
	strategyIds: readonly string[]
): Promise<StrategyPerformanceSummary[]> {
	const database = await getDatabase();
	return database
		.collection<StrategyPerformanceSummary>('strategyPerformanceSummaries')
		.find({ strategyVersion: 1, strategyId: { $in: strategyIds } })
		.toArray();
}
