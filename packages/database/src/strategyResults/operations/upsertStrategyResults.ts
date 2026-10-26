import type { StrategyResult } from "@black-diamond/core/strategyResult";
import { getDatabase } from "../../mongodb.js";

export async function upsertStrategyResults(results: StrategyResult[]): Promise<void> {
  if (results.length === 0) return;

  const database = await getDatabase();
  await database.collection<StrategyResult>("strategyResults").bulkWrite(
    results.map((result) => ({
      updateOne: {
        filter: {
          fixtureId: result.fixtureId,
          strategyId: result.strategyId,
          strategyVersion: result.strategyVersion,
        },
        update: { $set: result },
        upsert: true,
      },
    })),
  );
}
