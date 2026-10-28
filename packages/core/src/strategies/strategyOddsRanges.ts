const ranges = [
	{ id: '1-1.19', label: '1.00 – 1.19', minimum: 1, maximum: 1.2 },
	{ id: '1.20-1.39', label: '1.20 – 1.39', minimum: 1.2, maximum: 1.4 },
	{ id: '1.40-1.59', label: '1.40 – 1.59', minimum: 1.4, maximum: 1.6 },
	{ id: '1.60+', label: '1.60+', minimum: 1.6, maximum: Number.POSITIVE_INFINITY },
	{ id: '1-1.69', label: '1.00 – 1.69', minimum: 1, maximum: 1.7 },
	{ id: '1.70-1.99', label: '1.70 – 1.99', minimum: 1.7, maximum: 2 },
	{ id: '2.00-2.49', label: '2.00 – 2.49', minimum: 2, maximum: 2.5 },
	{ id: '2.50+', label: '2.50+', minimum: 2.5, maximum: Number.POSITIVE_INFINITY }
] as const;

export const over1_5OddsRanges = ranges.slice(0, 4);
export const over2_5OddsRanges = ranges.slice(4);
export const strategyOddsRanges = ranges;
export type StrategyOddsRangeId = (typeof ranges)[number]['id'];
export type StrategyOddsFilter = 'all' | StrategyOddsRangeId;

export function getStrategyOddsRangeIds(odd: number): StrategyOddsRangeId[] {
	if (!Number.isFinite(odd) || odd <= 1) return [];
	return ranges
		.filter((range) => odd >= range.minimum && odd < range.maximum)
		.map((range) => range.id);
}
