import type { Bet } from "@black-diamond/core/bet";
import type { Fixture } from "@black-diamond/core/fixture";
import { getWatchingAccountIds } from "@black-diamond/database/fixtureWatchlist";
import { getPushSubscriptionsByAccountIds } from "@black-diamond/database/pushSubscriptions";
import webpush from "web-push";

export async function notifyAccumulatorSettlement(
  bet: Bet,
  fixturesById: ReadonlyMap<number, Fixture>,
  results: boolean[],
  status: "won" | "lost",
) {
  if (
    bet.selections.length < 2 ||
    !process.env.VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY
  )
    return;

  const watchingAccountIds = new Set(
    (
      await Promise.all(
        bet.selections.map((selection) =>
          getWatchingAccountIds(selection.fixture.id),
        ),
      )
    ).flat(),
  );
  if (!watchingAccountIds.has(bet.accountId)) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:notifications@blackdiamond.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const body = bet.selections
    .map((selection, index) => {
      const fixture = fixturesById.get(selection.fixture.id);
      const score = fixture
        ? `${fixture.teams.home.name} ${fixture.score?.fulltime.home ?? fixture.goals.home ?? 0}–${fixture.score?.fulltime.away ?? fixture.goals.away ?? 0} ${fixture.teams.away.name}`
        : `${selection.fixture.homeTeamName} v ${selection.fixture.awayTeamName}`;
      return `${score} · ${selection.market.selection} · ${results[index] ? "Won" : "Lost"}`;
    })
    .join("\n");

  await Promise.all(
    (await getPushSubscriptionsByAccountIds([bet.accountId])).map(
      ({ subscription }) =>
        webpush
          .sendNotification(
            subscription,
            JSON.stringify({
              title: `Accumulator settled · ${status === "won" ? "Won" : "Lost"}`,
              body,
              url: `/account/bets`,
            }),
          )
          .catch(() => undefined),
    ),
  );
}
