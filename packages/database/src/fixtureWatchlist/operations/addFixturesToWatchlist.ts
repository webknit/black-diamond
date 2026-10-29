import type { FixtureWatchlistEntry } from '@black-diamond/core/fixtureWatchlist';
import { getDatabase } from '../../mongodb.js';

/** Adds fixture IDs without removing entries that are already being watched. */
export async function addFixturesToWatchlist(accountId: string, fixtureIds: number[]): Promise<void> {
	const uniqueFixtureIds = [...new Set(fixtureIds)];
	if (uniqueFixtureIds.length === 0) return;

	const savedAt = new Date().toISOString();
	await (await getDatabase()).collection<FixtureWatchlistEntry>('fixtureWatchlist').bulkWrite(
		uniqueFixtureIds.map((fixtureId) => ({
			updateOne: {
				filter: { accountId, fixtureId },
				update: { $setOnInsert: { accountId, fixtureId, savedAt } },
				upsert: true
			}
		}))
	);
}
