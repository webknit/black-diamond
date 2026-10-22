import { afterEach, describe, expect, it } from 'vitest';
import { loadAmplifyRuntimeSecrets } from './loadAmplifyRuntimeSecrets.js';

const originalMongoUri = process.env.MONGODB_URI;
const originalDatabaseName = process.env.MONGODB_DATABASE;

afterEach(() => {
	process.env.MONGODB_URI = originalMongoUri;
	process.env.MONGODB_DATABASE = originalDatabaseName;
});

describe('loadAmplifyRuntimeSecrets', () => {
	it('adds string secrets to the runtime environment', () => {
		loadAmplifyRuntimeSecrets(
			JSON.stringify({ MONGODB_URI: 'mongodb://example.test', MONGODB_DATABASE: 'black-diamond' })
		);

		expect(process.env.MONGODB_URI).toBe('mongodb://example.test');
		expect(process.env.MONGODB_DATABASE).toBe('black-diamond');
	});

	it('does nothing when Amplify did not provide runtime secrets', () => {
		expect(() => loadAmplifyRuntimeSecrets('')).not.toThrow();
	});

	it('rejects malformed runtime secrets', () => {
		expect(() => loadAmplifyRuntimeSecrets('{')).toThrow('Amplify runtime secrets could not be parsed');
	});
});
