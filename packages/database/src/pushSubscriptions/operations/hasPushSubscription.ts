import { getDatabase } from '../../mongodb.js';
export async function hasPushSubscription(accountId: string): Promise<boolean> { return (await getDatabase()).collection('pushSubscriptions').countDocuments({ accountId }, { limit: 1 }).then((count) => count > 0); }
