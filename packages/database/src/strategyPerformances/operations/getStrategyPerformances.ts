import type { StrategyPerformance } from "@black-diamond/core/strategyPerformance";
import { getDatabase } from "../../mongodb.js";

export async function getStrategyPerformances(): Promise<StrategyPerformance[]> {
  const database = await getDatabase();
  return database.collection<StrategyPerformance>("strategyPerformances").find({ strategyVersion: 1 }).toArray();
}
