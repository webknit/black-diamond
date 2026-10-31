import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';

type TeamMode = 'bothTeams' | 'atLeastOneTeam';
export type Under1_5StrategyVariation = { id: string; title: string; description: string; scoringThreshold?: number; defensiveThreshold?: number; mode?: TeamMode; under1_5RateThreshold?: number };
const thresholds = [0.3, 0.5, 0.7] as const;
const label = (mode: TeamMode) => mode === 'bothTeams' ? 'Both teams' : 'At least one team';

function createVariation(scoringThreshold: number | undefined, defensiveThreshold: number | undefined, mode: TeamMode): Under1_5StrategyVariation {
	const requirements = [scoringThreshold === undefined ? null : `${label(mode)}: score <= ${scoringThreshold}`, defensiveThreshold === undefined ? null : `${label(mode)}: concede <= ${defensiveThreshold}`].filter((item): item is string => item !== null);
	return { id: `under1_5-${[scoringThreshold === undefined ? null : `score${scoringThreshold}`, defensiveThreshold === undefined ? null : `concede${defensiveThreshold}`, mode].filter(Boolean).join('-')}`, title: requirements.join(' · '), description: `Last 5 relevant-venue matches must meet: ${requirements.join('; ')}.`, scoringThreshold, defensiveThreshold, mode };
}

export const under1_5StrategyVariations: Under1_5StrategyVariation[] = [
	{ id: 'under1_5-base', title: 'Base · no team filters', description: 'Every fixture with a stored pre-match Under 1.5 price above the odds floor.' },
	...[40, 60, 80].map((threshold) => ({ id: `under1_5-rate${threshold}-last5`, title: `Both teams: last 5 Under 1.5 >= ${threshold}%`, description: `Each team had Under 1.5 goals in at least ${threshold}% of its previous 5 relevant-venue matches.`, under1_5RateThreshold: threshold })),
	...thresholds.flatMap((threshold) => (['bothTeams', 'atLeastOneTeam'] as const).map((mode) => createVariation(threshold, undefined, mode))),
	...thresholds.flatMap((threshold) => (['bothTeams', 'atLeastOneTeam'] as const).map((mode) => createVariation(undefined, threshold, mode))),
	...thresholds.flatMap((threshold) => (['bothTeams', 'atLeastOneTeam'] as const).map((mode) => createVariation(threshold, threshold, mode)))
];

function average(goals: number, played: number) { return played === 0 ? null : goals / played; }
function meets(values: Array<number | null>, threshold: number, mode: TeamMode) { return !values.some((value) => value === null) && (mode === 'bothTeams' ? values.every((value) => value! <= threshold) : values.some((value) => value! <= threshold)); }
export function matchesUnder1_5StrategyVariation(snapshot: FixtureStatsSnapshot, variation: Under1_5StrategyVariation) {
	if (variation.under1_5RateThreshold === undefined && variation.scoringThreshold === undefined && variation.defensiveThreshold === undefined) return true;
	const home = snapshot.home.last5Venue; const away = snapshot.away.last5Venue;
	if (home.played !== 5 || away.played !== 5) return false;
	if (variation.under1_5RateThreshold !== undefined && (home.summary.under1_5.percentage < variation.under1_5RateThreshold || away.summary.under1_5.percentage < variation.under1_5RateThreshold)) return false;
	const mode = variation.mode ?? 'bothTeams';
	return (variation.scoringThreshold === undefined || meets([average(home.goalsFor, home.played), average(away.goalsFor, away.played)], variation.scoringThreshold, mode)) && (variation.defensiveThreshold === undefined || meets([average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)], variation.defensiveThreshold, mode));
}
