import { syncStrategyPerformances } from "../sync/strategyPerformances/syncStrategyPerformances";

export async function runStrategyResultsBackfill(): Promise<void> {
  await syncStrategyPerformances();
}
