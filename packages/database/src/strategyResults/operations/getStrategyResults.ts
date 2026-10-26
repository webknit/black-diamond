import type { StrategyResult } from "@black-diamond/core/strategyResult";
import { getDatabase } from "../../mongodb.js";

export async function getStrategyResults(strategyIds?: string[]): Promise<StrategyResult[]> {
  const database = await getDatabase();
  return database.collection<StrategyResult>("strategyResults").find(
    strategyIds && strategyIds.length > 0 ? { strategyId: { $in: strategyIds } } : {},
  ).toArray();
}
