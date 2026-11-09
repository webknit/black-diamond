import { resetAccount } from '@black-diamond/database/accounts';

const [initialDepositInput, confirmation] = process.argv.slice(2).filter((argument) => argument !== '--');
const initialDeposit = Number(initialDepositInput);

if (confirmation !== '--confirm') {
	throw new Error('This clears all bets and balance history. Re-run with: reset:account -- 200 --confirm');
}

const reset = await resetAccount('main', initialDeposit, new Date().toISOString());
if (!reset) throw new Error('The main account does not exist.');

console.info(`Reset the main account with a £${initialDeposit.toFixed(2)} initial deposit and cleared all bets and balance history.`);
