import { describe, expect, it } from 'vitest';
import { createSessionToken, getSessionAccountId } from './session.js';

describe('session tokens', () => {
	const secret = 'test-session-secret';
	const now = new Date('2026-10-22T09:00:00.000Z').getTime();

	it('returns the account ID from a valid token', () => {
		const token = createSessionToken('main', secret, now);

		expect(getSessionAccountId(token, secret, now)).toBe('main');
	});

	it('rejects modified and expired tokens', () => {
		const token = createSessionToken('main', secret, now);

		expect(getSessionAccountId(token.replace('main', 'other'), secret, now)).toBeNull();
		expect(getSessionAccountId(token, secret, now + 31 * 24 * 60 * 60 * 1000)).toBeNull();
	});
});
