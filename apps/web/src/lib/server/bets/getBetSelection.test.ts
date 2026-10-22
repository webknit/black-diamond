import { describe, expect, it } from 'vitest';
import { getBetSelection } from './getBetSelection.js';

describe('getBetSelection', () => {
	it.each([
		['Match Winner', 'Home', { type: 'matchWinner', outcome: 'home', line: null }],
		['Double Chance', 'Home/Draw', { type: 'doubleChance', outcome: 'homeDraw', line: null }],
		['Goals Over/Under', 'Over 2.5', { type: 'goalsOverUnder', outcome: 'over', line: 2.5 }],
		['Goals Over Under', 'Under 1.5', { type: 'goalsOverUnder', outcome: 'under', line: 1.5 }],
		['Both Teams Score', 'Yes', { type: 'btts', outcome: 'yes', line: null }]
	])('maps %s / %s', (marketName, selection, expected) => {
		expect(getBetSelection(marketName, selection)).toEqual(expected);
	});

	it('rejects an unsupported price selection', () => {
		expect(getBetSelection('Match Winner', 'Neither')).toBeNull();
	});
});
