import { upsertFixtureEvents } from "@black-diamond/database/fixtureEvents";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixtureEventsResponse } from "../../providers/api-football/types/fixtureEvents.js";

export async function syncFixtureEvents(fixtureIds: number[]): Promise<number> {
  const apiFootball = getApiFootballClient();

  for (const fixtureId of fixtureIds) {
    const response = await apiFootball.get<ApiFootballFixtureEventsResponse>("/fixtures/events", {
      fixture: fixtureId,
    });
    await upsertFixtureEvents({
      fixtureId,
      events: response.response,
      syncedAt: new Date().toISOString(),
    });
  }

  return fixtureIds.length;
}
