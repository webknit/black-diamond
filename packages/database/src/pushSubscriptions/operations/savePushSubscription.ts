import { getDatabase } from '../../mongodb.js';
export async function savePushSubscription(accountId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  await (await getDatabase()).collection('pushSubscriptions').updateOne({ endpoint: subscription.endpoint }, { $set: { accountId, subscription, updatedAt: new Date().toISOString() } }, { upsert: true });
}
