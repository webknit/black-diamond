import {
	getBalanceHistoryByAccountId,
	getBalanceTransactionsPage
} from '@black-diamond/database/balanceTransactions';
import { getBetsByAccountId } from '@black-diamond/database/bets';
import { redirect } from '@sveltejs/kit';
import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';

const pageSize = 25;

export async function load({ locals, url }: { locals: App.Locals; url: URL }) {
	if (!locals.accountId) throw redirect(303, '/login');

	const requestedPage = Number(url.searchParams.get('page') ?? '1');
	const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const yearStart = new Date(`${getUkDateKey(new Date()).slice(0, 7)}-01T00:00:00.000Z`);
	yearStart.setUTCMonth(yearStart.getUTCMonth() - 11);
	const [historyTransactions, transactionPage, bets] = await Promise.all([
		getBalanceHistoryByAccountId(locals.accountId, yearStart.toISOString()),
		getBalanceTransactionsPage(locals.accountId, page, pageSize),
		getBetsByAccountId(locals.accountId)
	]);
	const betDetailsById = new Map(
		bets.map((bet) => [
			bet.id,
			bet.selections
				.map(
					(selection) =>
						`${selection.fixture.homeTeamName} v ${selection.fixture.awayTeamName} · ${selection.market.selection}`
				)
				.join(', ')
		])
	);

	return {
		page: transactionPage.page,
		pageSize,
		totalCount: transactionPage.totalCount,
		transactions: transactionPage.items.map((transaction) => ({
			...transaction,
			description: transaction.referenceId
				? betDetailsById.get(transaction.referenceId) ?? `Bet ${transaction.referenceId.slice(0, 8)}`
				: null
		})),
		historyTransactions,
		bets: bets.map((bet) => ({
			id: bet.id,
			stake: bet.stake,
			placedAt: bet.placedAt,
			settledAt: bet.settledAt,
			selections: bet.selections.map((selection) => ({
				homeTeamName: selection.fixture.homeTeamName,
				awayTeamName: selection.fixture.awayTeamName,
				market: selection.market.selection
			}))
		}))
	};
}
