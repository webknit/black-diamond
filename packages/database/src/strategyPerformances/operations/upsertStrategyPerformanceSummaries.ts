import type { StrategyPerformanceSummary } from '@black-diamond/core/strategyPerformance';
import { getDatabase } from '../../mongodb.js';

export async function upsertStrategyPerformanceSummaries(
	summaries: StrategyPerformanceSummary[]
): Promise<void> {
	if (summaries.length === 0) return;

	const database = await getDatabase();
	await database.collection<StrategyPerformanceSummary>('strategyPerformanceSummaries').bulkWrite(
		summaries.map((summary) => ({
			replaceOne: {
				filter: { strategyId: summary.strategyId, strategyVersion: summary.strategyVersion },
				replacement: summary,
				upsert: true
			}
		}))
	);
}
