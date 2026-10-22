import { createHmac, timingSafeEqual } from 'node:crypto';

const sessionDurationMilliseconds = 30 * 24 * 60 * 60 * 1000;

function sign(value: string, secret: string): string {
	return createHmac('sha256', secret).update(value).digest('base64url');
}

export function createSessionToken(accountId: string, secret: string, now = Date.now()): string {
	const expiresAt = now + sessionDurationMilliseconds;
	const payload = `${accountId}.${expiresAt}`;

	return `${payload}.${sign(payload, secret)}`;
}

export function getSessionAccountId(token: string | undefined, secret: string, now = Date.now()): string | null {
	if (!token) return null;

	const [accountId, expiresAtValue, signature] = token.split('.');
	const expiresAt = Number(expiresAtValue);
	if (!accountId || !signature || !Number.isFinite(expiresAt) || expiresAt <= now) return null;

	const expectedSignature = sign(`${accountId}.${expiresAtValue}`, secret);
	const signatureBuffer = Buffer.from(signature);
	const expectedSignatureBuffer = Buffer.from(expectedSignature);
	if (signatureBuffer.length !== expectedSignatureBuffer.length) return null;

	return timingSafeEqual(signatureBuffer, expectedSignatureBuffer) ? accountId : null;
}

export const sessionCookieName = 'black-diamond-session';
export const sessionMaxAgeSeconds = sessionDurationMilliseconds / 1000;
