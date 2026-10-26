import type { StrategyPerformance } from "@black-diamond/core/strategyPerformance";
import { getDatabase } from "../../mongodb.js";

export async function upsertStrategyPerformances(
  performances: StrategyPerformance[],
): Promise<void> {
  if (performances.length === 0) return;

  const database = await getDatabase();
  await database.collection<StrategyPerformance>("strategyPerformances").bulkWrite(
    performances.map((performance) => ({
      replaceOne: {
        filter: {
          strategyId: performance.strategyId,
          strategyVersion: performance.strategyVersion,
          "league.id": performance.league.id,
          season: performance.season,
        },
        replacement: performance,
        upsert: true,
      },
    })),
  );
}
