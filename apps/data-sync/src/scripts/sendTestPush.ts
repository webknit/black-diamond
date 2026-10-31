import { getPushSubscriptionsByAccountIds } from "@black-diamond/database/pushSubscriptions";
import { closeDatabase } from "@black-diamond/database/mongodb";
import webpush from "web-push";

const accountId = process.argv[2] ?? "main";
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set.");
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:notifications@blackdiamond.app",
  publicKey,
  privateKey,
);

try {
  const subscriptions = await getPushSubscriptionsByAccountIds([accountId]);

  if (subscriptions.length === 0) {
    console.log(`[push] No subscribed devices found for account ${accountId}.`);
  } else {
    const results = await Promise.allSettled(
      subscriptions.map(({ subscription }) =>
        webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "Black Diamond test",
            body: "Notifications are working on this device.",
            url: "/account",
          }),
        ),
      ),
    );
    const sent = results.filter((result) => result.status === "fulfilled").length;
    const failed = results.length - sent;
    console.log(`[push] Sent test notification to ${sent}/${results.length} subscribed devices for account ${accountId}.${failed ? ` ${failed} failed.` : ""}`);
  }
} finally {
  await closeDatabase();
}
