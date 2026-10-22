import type { BetMarketType, BetOutcome } from '@black-diamond/core/bet';

export type BetSelection = {
	type: BetMarketType;
	outcome: BetOutcome;
	line: number | null;
};

export function getBetSelection(marketName: string, selection: string): BetSelection | null {
	const normalizedMarket = marketName.trim().toLowerCase();
	const normalizedSelection = selection.trim().toLowerCase();

	if (normalizedMarket === 'match winner') {
		const outcomes: Record<string, BetOutcome> = { home: 'home', draw: 'draw', away: 'away' };
		const outcome = outcomes[normalizedSelection];
		return outcome ? { type: 'matchWinner', outcome, line: null } : null;
	}

	if (normalizedMarket === 'double chance') {
		const outcomes: Record<string, BetOutcome> = {
			'home/draw': 'homeDraw',
			'home or draw': 'homeDraw',
			'home/away': 'homeAway',
			'home or away': 'homeAway',
			'draw/away': 'drawAway',
			'draw or away': 'drawAway'
		};
		const outcome = outcomes[normalizedSelection];
		return outcome ? { type: 'doubleChance', outcome, line: null } : null;
	}

	if (normalizedMarket === 'goals over/under' || normalizedMarket === 'goals over under') {
		const match = normalizedSelection.match(/^(over|under)\s+(\d+(?:\.\d+)?)$/);
		if (!match) return null;

		return {
			type: 'goalsOverUnder',
			outcome: match[1] as 'over' | 'under',
			line: Number(match[2])
		};
	}

	if (normalizedMarket === 'both teams score') {
		const outcomes: Record<string, BetOutcome> = { yes: 'yes', no: 'no' };
		const outcome = outcomes[normalizedSelection];
		return outcome ? { type: 'btts', outcome, line: null } : null;
	}

	return null;
}
