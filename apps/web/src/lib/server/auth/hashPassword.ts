import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('base64url');
	const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;

	return `${salt}:${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
	const [salt, storedKey] = passwordHash.split(':');
	if (!salt || !storedKey) return false;

	const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;
	return derivedKey.toString('base64url') === storedKey;
}
