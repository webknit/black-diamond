import type { StrategyPerformance } from "@black-diamond/core/strategyPerformance";
import { getDatabase } from "../../mongodb.js";

type GetStrategyPerformancesOptions = {
  strategyIds?: readonly string[];
  oddsRangeId?: string | null;
};

export async function getStrategyPerformances({
  strategyIds,
  oddsRangeId = null,
}: GetStrategyPerformancesOptions = {}): Promise<StrategyPerformance[]> {
  const database = await getDatabase();

  const projection = oddsRangeId === null
    ? { strategyId: 1, seasonPerformance: 1, weeks: 1 }
    : {
        strategyId: 1,
        weeks: 1,
        [`oddsBands.${oddsRangeId}.seasonPerformance`]: 1,
        [`oddsBands.${oddsRangeId}.weeks`]: 1,
      };

  return database
    .collection<StrategyPerformance>("strategyPerformances")
    .find({
      strategyVersion: 1,
      ...(strategyIds === undefined ? {} : { strategyId: { $in: strategyIds } }),
    }, { projection })
    .toArray();
}
