import type { FixtureWatchlistEntry } from '@black-diamond/core/fixtureWatchlist';
import { getDatabase } from '../../mongodb.js';
export async function toggleFixtureWatchlist(accountId: string, fixtureId: number): Promise<boolean> {
	const collection = (await getDatabase()).collection<FixtureWatchlistEntry>('fixtureWatchlist');
	if ((await collection.deleteOne({ accountId, fixtureId })).deletedCount === 1) return false;
	await collection.insertOne({ accountId, fixtureId, savedAt: new Date().toISOString() });
	return true;
}
