import { upsertLeague } from "@black-diamond/database/leagues";
import { selectedLeagues } from "../../config/selectedLeagues.js";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballLeaguesResponse } from "../../providers/api-football/types/leagues.js";

type SelectedLeague = (typeof selectedLeagues)[number];

export async function syncLeague(league: SelectedLeague) {
  const apiFootball = getApiFootballClient();

  const response = await apiFootball.get<ApiFootballLeaguesResponse>("/leagues", {
    id: league.id,
  });

  const syncedLeague = response.response[0];

  if (!syncedLeague) {
    throw new Error(`API-Football returned no league for ID ${league.id}`);
  }

  await upsertLeague(syncedLeague);

  return syncedLeague;
}
