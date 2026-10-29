import {
  getFixturesAwaitingResult,
  upsertFixtures,
} from "@black-diamond/database/fixtures";

import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixturesResponse } from "../../providers/api-football/types/fixtures.js";
import { getWatchingAccountIds } from "@black-diamond/database/fixtureWatchlist";
import { getPushSubscriptionsByAccountIds } from "@black-diamond/database/pushSubscriptions";
import webpush from "web-push";
import { getBetsForFixturesByAccountId } from "@black-diamond/database/bets";
import { didBetSelectionWin } from "../bets/didBetSelectionWin.js";
import type { Fixture } from "@black-diamond/core/fixture";

export function didFixtureScoreIncrease(
  previous: Fixture["goals"],
  refreshed: Fixture["goals"],
) {
  const previousTotal = (previous.home ?? 0) + (previous.away ?? 0);
  const refreshedTotal = (refreshed.home ?? 0) + (refreshed.away ?? 0);

  return refreshedTotal > previousTotal;
}

export function formatMatchMinute(
  time: { elapsed: number | null; extra?: number | null },
) {
  if (time.elapsed === null) return null;
  return `${time.elapsed}′${time.extra ? `+${time.extra}` : ""}`;
}

export async function syncFixturesInProgress() {
  const apiFootball = getApiFootballClient();
  const fixturesAwaitingResult = await getFixturesAwaitingResult();
  const fixtureIds = fixturesAwaitingResult.map(
    (fixture) => fixture.fixture.id,
  );
  const refreshedFixtures = await fetchFixturesByIds(apiFootball, fixtureIds);
  await notifyFixtureChanges(fixturesAwaitingResult, refreshedFixtures);

  await upsertFixtures(refreshedFixtures);

  return refreshedFixtures;
}

async function notifyFixtureChanges(
  previous: Fixture[],
  refreshed: Fixture[],
) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:notifications@blackdiamond.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  const old = new Map(previous.map((fixture) => [fixture.fixture.id, fixture]));
  for (const fixture of refreshed) {
    const before = old.get(fixture.fixture.id);
    if (!before) continue;
    const fullTime =
      ["FT", "AET", "PEN"].includes(fixture.fixture.status.short) &&
      !["FT", "AET", "PEN"].includes(before.fixture.status.short);
    const goal = didFixtureScoreIncrease(before.goals, fixture.goals);
    if (!fullTime && !goal) continue;
    const updateMinute = goal
      ? formatMatchMinute({ elapsed: fixture.fixture.status.elapsed })
      : null;
    const subscriptions = await getPushSubscriptionsByAccountIds(
      await getWatchingAccountIds(fixture.fixture.id),
    );
    const score = `${fixture.teams.home.name} ${fixture.goals.home ?? 0}–${fixture.goals.away ?? 0} ${fixture.teams.away.name}`;
    await Promise.all(
      subscriptions.map(async ({ accountId, subscription }) => {
        const bets = fullTime
          ? await getBetsForFixturesByAccountId(accountId, [fixture.fixture.id])
          : [];
        const selection = bets
          .flatMap((bet) => bet.selections)
          .find((item) => item.fixture.id === fixture.fixture.id);
        const result = selection
          ? didBetSelectionWin(selection, fixture)
          : null;
        const title =
          fullTime && selection && result !== null
            ? `Full time · ${selection.market.selection} · ${result ? "Won" : "Lost"}`
            : fullTime
              ? "Full time"
              : `⚽ Update${updateMinute ? ` · ${updateMinute}` : ""}`;
        return webpush
          .sendNotification(
            subscription,
            JSON.stringify({
              title,
              body: score,
              url: `/fixtures/${fixture.fixture.id}`,
            }),
          )
          .catch(() => undefined);
      }),
    );
  }
}

async function fetchFixturesByIds(
  apiFootball: ReturnType<typeof getApiFootballClient>,
  fixtureIds: number[],
) {
  const batches = Array.from(
    { length: Math.ceil(fixtureIds.length / 20) },
    (_, index) => fixtureIds.slice(index * 20, index * 20 + 20),
  );
  const responses = await Promise.all(
    batches.map((fixtureIds) =>
      apiFootball.get<ApiFootballFixturesResponse>("/fixtures", {
        ids: fixtureIds.join("-"),
      }),
    ),
  );

  return responses.flatMap((response) => response.response);
}
