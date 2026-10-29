import { getDatabase } from '../../mongodb.js';
export async function getPushSubscriptionsByAccountIds(accountIds: string[]) { if (!accountIds.length) return []; return (await getDatabase()).collection<{ accountId: string; subscription: { endpoint: string; keys: { p256dh: string; auth: string } } }>('pushSubscriptions').find({ accountId: { $in: accountIds } }).toArray(); }
