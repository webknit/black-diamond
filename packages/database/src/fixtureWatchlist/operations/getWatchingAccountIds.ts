import { getDatabase } from '../../mongodb.js';
export async function getWatchingAccountIds(fixtureId: number): Promise<string[]> { return (await (await getDatabase()).collection<{ accountId: string }>('fixtureWatchlist').find({ fixtureId }, { projection: { _id: 0, accountId: 1 } }).toArray()).map((entry) => entry.accountId); }
