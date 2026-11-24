import { getBetsByAccountId } from '@black-diamond/database/bets';
import { redirect } from '@sveltejs/kit';

function betTypeLabel(selection: { market: { type: string; outcome: string; selection: string } }) {
	if (selection.market.type === 'btts') {
		return selection.market.outcome === 'yes' ? 'BTTS' : 'BTNTS';
	}
	return selection.market.selection;
}

export async function load({ locals }: { locals: App.Locals }) {
	if (!locals.accountId) throw redirect(303, '/login');

	const bets = await getBetsByAccountId(locals.accountId);
	const settledBets = bets.filter((bet) => bet.status !== 'pending');
	const wonBets = settledBets.filter((bet) => bet.status === 'won');
	const lostBets = settledBets.filter((bet) => bet.status === 'lost');
	const voidBets = settledBets.filter((bet) => bet.status === 'void');
	const settledStake = settledBets.reduce((total, bet) => total + bet.stake, 0);
	const totalProfitLoss = settledBets.reduce((total, bet) => total + (bet.profit ?? 0), 0);
	const byBetType = new Map<string, {
		betType: string;
		bets: number;
		wins: number;
		losses: number;
		voids: number;
		stake: number;
		profitLoss: number;
		oddsTotal: number;
	}>();
	for (const bet of settledBets) {
		const betType = bet.selections.map(betTypeLabel).join(' + ');
		const current = byBetType.get(betType) ?? {
			betType, bets: 0, wins: 0, losses: 0, voids: 0, stake: 0, profitLoss: 0, oddsTotal: 0
		};
		current.bets += 1;
		current.wins += bet.status === 'won' ? 1 : 0;
		current.losses += bet.status === 'lost' ? 1 : 0;
		current.voids += bet.status === 'void' ? 1 : 0;
		current.stake += bet.stake;
		current.profitLoss += bet.profit ?? 0;
		current.oddsTotal += bet.placedOdds;
		byBetType.set(betType, current);
	}

	return {
		summary: {
			totalBets: bets.length,
			settledBets: settledBets.length,
			pendingBets: bets.length - settledBets.length,
			wonBets: wonBets.length,
			lostBets: lostBets.length,
			voidBets: voidBets.length,
			settledStake,
			totalReturned: settledBets.reduce((total, bet) => total + (bet.returnAmount ?? 0), 0),
			totalProfitLoss,
			roi: settledStake > 0 ? (totalProfitLoss / settledStake) * 100 : null,
			winRate: wonBets.length + lostBets.length > 0
				? (wonBets.length / (wonBets.length + lostBets.length)) * 100
				: null,
			averageOdds: settledBets.length > 0
				? settledBets.reduce((total, bet) => total + bet.placedOdds, 0) / settledBets.length
				: null,
			byBetType: [...byBetType.values()]
				.map((type) => ({
					...type,
					averageOdds: type.oddsTotal / type.bets,
					roi: type.stake > 0 ? (type.profitLoss / type.stake) * 100 : null,
					winRate: type.wins + type.losses > 0 ? (type.wins / (type.wins + type.losses)) * 100 : null
				}))
				.sort((left, right) => right.profitLoss - left.profitLoss)
		}
	};
}
