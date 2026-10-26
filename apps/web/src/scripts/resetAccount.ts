import { resetAccount } from '@black-diamond/database/accounts';

const [startingBalanceInput, confirmation] = process.argv.slice(2).filter((argument) => argument !== '--');
const startingBalance = Number(startingBalanceInput);

if (confirmation !== '--confirm') {
	throw new Error('This clears all bets and balance history. Re-run with: reset:account -- 200 --confirm');
}

const reset = await resetAccount('main', startingBalance, new Date().toISOString());
if (!reset) throw new Error('The main account does not exist.');

console.info(`Reset the main account to £${startingBalance.toFixed(2)} and cleared all bets and balance history.`);
