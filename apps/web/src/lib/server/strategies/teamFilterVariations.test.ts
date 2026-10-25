import { describe, expect, it } from 'vitest';
import { matchesTeamFilterVariation, teamFilterVariations } from './teamFilterVariations.js';

const snapshot = (homeFor: number, homeAgainst: number, awayFor: number, awayAgainst: number) => ({
	home: { fixtures: { home: { goalsFor: homeFor, goalsAgainst: homeAgainst, played: 10 } } },
	away: { fixtures: { away: { goalsFor: awayFor, goalsAgainst: awayAgainst, played: 10 } } }
}) as never;

describe('teamFilterVariations', () => {
	it('creates every scoring, defensive, combined and exclusion-mode variation', () => {
		expect(teamFilterVariations).toHaveLength(31);
	});

	it('rejects a fixture where either team is below a scoring threshold', () => {
		const variation = teamFilterVariations.find((item) => item.id === 'score1.5-eitherTeam')!;
		expect(matchesTeamFilterVariation(snapshot(16, 20, 14, 20), variation)).toBe(false);
	});

	it('allows one low-scoring team when only both teams being low is excluded', () => {
		const variation = teamFilterVariations.find((item) => item.id === 'score1.5-bothTeams')!;
		expect(matchesTeamFilterVariation(snapshot(16, 20, 14, 20), variation)).toBe(true);
	});

	it('applies defensive and scoring filters together', () => {
		const variation = teamFilterVariations.find((item) => item.id === 'score1.5-defend1.3-eitherTeam')!;
		expect(matchesTeamFilterVariation(snapshot(16, 12, 17, 9), variation)).toBe(false);
	});
});
