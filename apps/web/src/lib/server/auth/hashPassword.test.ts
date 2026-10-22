import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './hashPassword.js';

describe('hashPassword', () => {
	it('creates different salted hashes for the same password', async () => {
		const [firstHash, secondHash] = await Promise.all([
			hashPassword('a-strong-password'),
			hashPassword('a-strong-password')
		]);

		expect(firstHash).not.toBe(secondHash);
		expect(firstHash.split(':')).toHaveLength(2);
	});

	it('verifies the original password but not a different one', async () => {
		const passwordHash = await hashPassword('a-strong-password');

		await expect(verifyPassword('a-strong-password', passwordHash)).resolves.toBe(true);
		await expect(verifyPassword('a-different-password', passwordHash)).resolves.toBe(false);
	});
});
