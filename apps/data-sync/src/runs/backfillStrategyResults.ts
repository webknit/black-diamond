import { syncStrategyPerformances } from "../sync/strategyPerformances/syncStrategyPerformances.js";

export async function runStrategyResultsBackfill(): Promise<void> {
  await syncStrategyPerformances();
}
