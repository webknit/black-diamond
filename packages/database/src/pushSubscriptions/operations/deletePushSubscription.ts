import { getDatabase } from '../../mongodb.js';

export async function deletePushSubscription(accountId: string, endpoint: string): Promise<void> {
	await (await getDatabase())
		.collection('pushSubscriptions')
		.deleteOne({ accountId, endpoint });
}
