import { getDatabase } from '../../mongodb.js';
export async function getWatchlistFixtureIds(accountId: string): Promise<number[]> {
	const entries = await (await getDatabase()).collection<{ fixtureId: number }>('fixtureWatchlist').find({ accountId }, { projection: { _id: 0, fixtureId: 1 } }).toArray();
	return entries.map((entry) => entry.fixtureId);
}
