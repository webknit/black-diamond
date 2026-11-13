import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';
type Mode = 'bothTeams' | 'atLeastOneTeam';
export type Over3_5StrategyVariation = { id: string; title: string; description: string; scoringThreshold?: number; defensiveThreshold?: number; mode?: Mode; over3_5RateThreshold?: number };
const thresholds = [0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7] as const;
const label = (mode: Mode) => mode === 'bothTeams' ? 'Both teams' : 'At least one team';
const variation = (score: number | undefined, concede: number | undefined, mode: Mode): Over3_5StrategyVariation => {
	const parts = [score === undefined ? null : `${label(mode)}: score >= ${score}`, concede === undefined ? null : `${label(mode)}: concede >= ${concede}`].filter((part): part is string => part !== null);
	return { id: `over3_5-${[score === undefined ? null : `score${score}`, concede === undefined ? null : `concede${concede}`, mode].filter(Boolean).join('-')}`, title: parts.join(' · '), description: `Last 5 relevant-venue matches must meet: ${parts.join('; ')}.`, scoringThreshold: score, defensiveThreshold: concede, mode };
};
export const over3_5StrategyVariations: Over3_5StrategyVariation[] = [
	{ id: 'over3_5-base', title: 'Base · no team filters', description: 'Every fixture with a stored pre-match Over 3.5 price above the odds floor.' },
	...[40, 60, 80].map((rate) => ({ id: `over3_5-rate${rate}-last5`, title: `Both teams: last 5 Over 3.5 >= ${rate}%`, description: `Each team had Over 3.5 goals in at least ${rate}% of its previous 5 matches.`, over3_5RateThreshold: rate })),
	...thresholds.flatMap((value) => (['bothTeams', 'atLeastOneTeam'] as const).flatMap((mode) => [variation(value, undefined, mode), variation(undefined, value, mode), variation(value, value, mode)]))
];
const average = (goals: number, played: number) => played === 0 ? null : goals / played;
const meets = (values: Array<number | null>, threshold: number, mode: Mode) => !values.some((value) => value === null) && (mode === 'bothTeams' ? values.every((value) => value! >= threshold) : values.some((value) => value! >= threshold));
export function matchesOver3_5StrategyVariation(snapshot: FixtureStatsSnapshot, strategy: Over3_5StrategyVariation) {
	if (strategy.over3_5RateThreshold === undefined && strategy.scoringThreshold === undefined && strategy.defensiveThreshold === undefined) return true;
	const home = snapshot.home.last5Venue, away = snapshot.away.last5Venue;
	if (home.played !== 5 || away.played !== 5) return false;
	if (strategy.over3_5RateThreshold !== undefined && (home.summary.over3_5.percentage < strategy.over3_5RateThreshold || away.summary.over3_5.percentage < strategy.over3_5RateThreshold)) return false;
	const mode = strategy.mode ?? 'bothTeams';
	return (strategy.scoringThreshold === undefined || meets([average(home.goalsFor, home.played), average(away.goalsFor, away.played)], strategy.scoringThreshold, mode)) && (strategy.defensiveThreshold === undefined || meets([average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)], strategy.defensiveThreshold, mode));
}
