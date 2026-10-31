import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

type TeamMode = 'bothTeams' | 'atLeastOneTeam';
export type Over0_5StrategyVariation = { id: string; title: string; description: string; threshold?: number; scoringThreshold?: number; defensiveThreshold?: number; scoringMode?: TeamMode; defensiveMode?: TeamMode };
const thresholds = [0.7, 0.9, 1.1] as const;
const label = (mode: TeamMode) => mode === 'bothTeams' ? 'Both teams' : 'At least one team';
function filtered(scoringThreshold: number | undefined, defensiveThreshold: number | undefined, scoringMode: TeamMode | undefined, defensiveMode: TeamMode | undefined): Over0_5StrategyVariation {
	const requirements = [scoringThreshold === undefined ? null : `${label(scoringMode!)}: score >= ${scoringThreshold}`, defensiveThreshold === undefined ? null : `${label(defensiveMode!)}: concede >= ${defensiveThreshold}`].filter((value): value is string => value !== null);
	return { id: `over0_5-${[scoringThreshold === undefined ? null : `score${scoringThreshold}-${scoringMode}`, defensiveThreshold === undefined ? null : `concede${defensiveThreshold}-${defensiveMode}`].filter(Boolean).join('-')}`, title: requirements.join(' · '), description: `Last 5 relevant-venue matches must meet: ${requirements.join('; ')}.`, scoringThreshold, defensiveThreshold, scoringMode, defensiveMode };
}
export const over0_5StrategyVariations: Over0_5StrategyVariation[] = [
	{ id: 'over0_5-base', title: 'Base · no team filters', description: 'Every fixture with a stored pre-match Over 0.5 price above the odds floor.' },
	...[60, 80, 100].map((threshold) => ({ id: `over0_5-rate${threshold}-last5`, title: `Both teams: last 5 Over 0.5 >= ${threshold}%`, description: `Each team had Over 0.5 goals in at least ${threshold}% of its previous 5 relevant-venue matches.`, threshold }))
	,...thresholds.flatMap((threshold) => (['bothTeams', 'atLeastOneTeam'] as const).map((mode) => filtered(threshold, undefined, mode, undefined)))
	,...thresholds.flatMap((threshold) => (['bothTeams', 'atLeastOneTeam'] as const).map((mode) => filtered(undefined, threshold, undefined, mode)))
	,...thresholds.flatMap((threshold) => (['bothTeams', 'atLeastOneTeam'] as const).flatMap((scoreMode) => (['bothTeams', 'atLeastOneTeam'] as const).map((defenceMode) => filtered(threshold, threshold, scoreMode, defenceMode))))
];
export function matchesOver0_5StrategyVariation(snapshot: FixtureStatsSnapshot, variation: Over0_5StrategyVariation) {
	if (variation.threshold === undefined && variation.scoringThreshold === undefined && variation.defensiveThreshold === undefined) return true;
	const home = snapshot.home.last5Venue, away = snapshot.away.last5Venue;
	if (home.played !== 5 || away.played !== 5) return false;
	if (variation.threshold !== undefined && (home.summary.over0_5.percentage < variation.threshold || away.summary.over0_5.percentage < variation.threshold)) return false;
	const meets = (values: number[], threshold: number, mode: TeamMode) => mode === 'bothTeams' ? values.every((value) => value >= threshold) : values.some((value) => value >= threshold);
	if (variation.scoringThreshold !== undefined && !meets([home.goalsFor / home.played, away.goalsFor / away.played], variation.scoringThreshold, variation.scoringMode!)) return false;
	if (variation.defensiveThreshold !== undefined && !meets([home.goalsAgainst / home.played, away.goalsAgainst / away.played], variation.defensiveThreshold, variation.defensiveMode!)) return false;
	return true;
}
