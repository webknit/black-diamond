import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { createAccount, getAccountById } from '@black-diamond/database/accounts';
import { ensureDatabaseIndexes } from '@black-diamond/database/indexes';
import { hashPassword } from '../lib/server/auth/hashPassword.js';

async function promptForPassword(prompt: string): Promise<string> {
	if (!input.isTTY) throw new Error('Account setup must run in an interactive terminal.');

	output.write(prompt);
	input.setRawMode(true);
	input.resume();

	return new Promise((resolve, reject) => {
		let password = '';

		function finish() {
			input.setRawMode(false);
			input.pause();
			input.off('data', onData);
			output.write('\n');
		}

		function onData(chunk: Buffer) {
			const character = chunk.toString();

			if (character === '\u0003') {
				finish();
				reject(new Error('Account setup cancelled.'));
				return;
			}

			if (character === '\r' || character === '\n') {
				finish();
				resolve(password);
				return;
			}

			if (character === '\u007f') {
				password = password.slice(0, -1);
				return;
			}

			if (character.length === 1) password += character;
		}

		input.on('data', onData);
	});
}

const accountId = 'main';
await ensureDatabaseIndexes();
const existingAccount = await getAccountById(accountId);

if (existingAccount) {
	throw new Error('The main account already exists. Account setup only runs once.');
}

const readline = createInterface({ input, output });
const email = (await readline.question('Email: ')).trim().toLowerCase();
const startingBalanceInput = await readline.question('Starting balance (GBP): ');
readline.close();

const startingBalance = Number(startingBalanceInput);
if (!email || !email.includes('@')) throw new Error('Enter a valid email address.');
if (!Number.isFinite(startingBalance) || startingBalance < 0) {
	throw new Error('Starting balance must be a positive number or zero.');
}

const password = await promptForPassword('Password: ');
const confirmedPassword = await promptForPassword('Confirm password: ');

if (password.length < 12) throw new Error('Use a password of at least 12 characters.');
if (password !== confirmedPassword) throw new Error('Passwords do not match.');

const now = new Date().toISOString();
await createAccount({
	id: accountId,
	email,
	passwordHash: await hashPassword(password),
	startingBalance,
	currentBalance: startingBalance,
	currency: 'GBP',
	createdAt: now,
	updatedAt: now
});

console.info(`Created account for ${email} with a £${startingBalance.toFixed(2)} balance.`);
