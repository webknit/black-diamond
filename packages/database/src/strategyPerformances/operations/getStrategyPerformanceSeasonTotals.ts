import type { StrategyPerformanceTotals } from '@black-diamond/core/strategyPerformance';
import { getDatabase } from '../../mongodb.js';

export type StrategyPerformanceSeasonTotals = {
	strategyId: string;
	seasonPerformance: StrategyPerformanceTotals;
};

export async function getStrategyPerformanceSeasonTotals(
	strategyIds: readonly string[]
): Promise<StrategyPerformanceSeasonTotals[]> {
	return (await getDatabase())
		.collection<StrategyPerformanceSeasonTotals>('strategyPerformanceSummaries')
		.find(
			{ strategyVersion: 1, strategyId: { $in: strategyIds } },
			{ projection: { _id: 0, strategyId: 1, seasonPerformance: 1 } }
		)
		.toArray();
}
