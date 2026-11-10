const ranges = [
	{ id: '1-1.07', label: '1.00 – 1.07', minimum: 1, maximum: 1.08 },
	{ id: '1.08-1.10', label: '1.08 – 1.10', minimum: 1.08, maximum: 1.11 },
	{ id: '1.11-1.15', label: '1.11 – 1.15', minimum: 1.11, maximum: 1.16 },
	{ id: '1.16-1.19', label: '1.16 – 1.19', minimum: 1.16, maximum: 1.2 },
	{ id: '1.20-1.39', label: '1.20 – 1.39', minimum: 1.2, maximum: 1.4 },
	{ id: '1.40-1.59', label: '1.40 – 1.59', minimum: 1.4, maximum: 1.6 },
	{ id: '1.60+', label: '1.60+', minimum: 1.6, maximum: Number.POSITIVE_INFINITY },
	{ id: '1-1.69', label: '1.00 – 1.69', minimum: 1, maximum: 1.7 },
	{ id: '1.70-1.99', label: '1.70 – 1.99', minimum: 1.7, maximum: 2 },
	{ id: '2.00-2.49', label: '2.00 – 2.49', minimum: 2, maximum: 2.5 },
	{ id: '2.50-2.99', label: '2.50 – 2.99', minimum: 2.5, maximum: 3 },
	{ id: '3.00+', label: '3.00+', minimum: 3, maximum: Number.POSITIVE_INFINITY }
] as const;

/** Display groups for Over 0.5. The final group aggregates all prices of 1.21 or above. */
export const over0_5OddsRanges = [
	{ id: '1-1.07', label: '1.00 – 1.07', bandIds: ['1-1.07'] },
	{ id: '1.08-1.10', label: '1.08 – 1.10', bandIds: ['1.08-1.10'] },
	{ id: '1.11-1.15', label: '1.11 – 1.15', bandIds: ['1.11-1.15'] },
	{ id: '1.16-1.20', label: '1.16 – 1.20', bandIds: ['1.16-1.19', '1.20-1.39'] },
	{ id: '1.21+', label: '1.21+', bandIds: ['1.20-1.39', '1.40-1.59', '1.60+'] }
] as const;
export const over1_5OddsRanges = ranges.slice(4, 7);
export const over2_5OddsRanges = ranges.slice(7);
export const under1_5OddsRanges = ranges.slice(11);
export const strategyOddsRanges = ranges;
export type StrategyOddsRangeId = (typeof ranges)[number]['id'];
export type StrategyOddsFilter = 'all' | 'bettable' | StrategyOddsRangeId;

export function getStrategyOddsRangeIds(odd: number): StrategyOddsRangeId[] {
	if (!Number.isFinite(odd) || odd <= 1) return [];
	return ranges
		.filter((range) => odd >= range.minimum && odd < range.maximum)
		.map((range) => range.id);
}
