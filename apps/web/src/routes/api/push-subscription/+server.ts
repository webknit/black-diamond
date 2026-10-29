import { error, json, redirect } from '@sveltejs/kit';
import { deletePushSubscription, savePushSubscription } from '@black-diamond/database/pushSubscriptions';
export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
 if (!locals.accountId) throw redirect(303, '/login');
 const subscription = await request.json().catch(() => null) as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | null;
 if (typeof subscription?.endpoint !== 'string' || typeof subscription.keys?.p256dh !== 'string' || typeof subscription.keys?.auth !== 'string') throw error(400, 'Invalid push subscription.');
 await savePushSubscription(locals.accountId, { endpoint: subscription.endpoint, keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } });
 return json({ subscribed: true });
}

export async function DELETE({ request, locals }: { request: Request; locals: App.Locals }) {
 if (!locals.accountId) throw redirect(303, '/login');
 const body = await request.json().catch(() => null) as { endpoint?: unknown } | null;
 if (typeof body?.endpoint !== 'string') throw error(400, 'Invalid push subscription endpoint.');
 await deletePushSubscription(locals.accountId, body.endpoint);
 return json({ subscribed: false });
}
