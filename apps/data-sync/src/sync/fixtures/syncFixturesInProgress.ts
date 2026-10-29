import {
  getFixturesAwaitingResult,
  upsertFixtures,
} from "@black-diamond/database/fixtures";

import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixturesResponse } from "../../providers/api-football/types/fixtures.js";
import { getWatchingAccountIds } from '@black-diamond/database/fixtureWatchlist';
import { getPushSubscriptionsByAccountIds } from '@black-diamond/database/pushSubscriptions';
import webpush from 'web-push';

export async function syncFixturesInProgress() {
  const apiFootball = getApiFootballClient();
  const fixturesAwaitingResult = await getFixturesAwaitingResult();
  const fixtureIds = fixturesAwaitingResult.map((fixture) => fixture.fixture.id);
  const refreshedFixtures = await fetchFixturesByIds(apiFootball, fixtureIds);
  await notifyFixtureChanges(fixturesAwaitingResult, refreshedFixtures);

  await upsertFixtures(refreshedFixtures);

  return refreshedFixtures;
}

async function notifyFixtureChanges(previous: typeof fixturesAwaitingResult, refreshed: typeof previous) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:notifications@blackdiamond.app', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const old = new Map(previous.map((fixture) => [fixture.fixture.id, fixture]));
  for (const fixture of refreshed) { const before = old.get(fixture.fixture.id); if (!before) continue; const fullTime = ['FT','AET','PEN'].includes(fixture.fixture.status.short) && !['FT','AET','PEN'].includes(before.fixture.status.short); const goal = fixture.goals.home !== before.goals.home || fixture.goals.away !== before.goals.away; if (!fullTime && !goal) continue; const subscriptions = await getPushSubscriptionsByAccountIds(await getWatchingAccountIds(fixture.fixture.id)); const score = `${fixture.teams.home.name} ${fixture.goals.home ?? 0}–${fixture.goals.away ?? 0} ${fixture.teams.away.name}`; await Promise.all(subscriptions.map(({ subscription }) => webpush.sendNotification(subscription, JSON.stringify({ title: fullTime ? 'Full time' : '⚽ Goal', body: score, url: `/fixtures/${fixture.fixture.id}` })).catch(() => undefined))); }
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
