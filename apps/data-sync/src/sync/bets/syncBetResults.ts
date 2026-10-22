import { getPendingBets, settleBet } from "@black-diamond/database/bets";
import { upsertFixtures } from "@black-diamond/database/fixtures";
import type { Fixture } from "@black-diamond/core/fixture";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixturesResponse } from "../../providers/api-football/types/fixtures.js";
import { didBetSelectionWin } from "./didBetSelectionWin.js";
const settledStatuses = new Set(["FT", "AET", "PEN"]);
export async function syncBetResults() {
  const pendingBets = await getPendingBets();
  const ids = [...new Set(pendingBets.flatMap((bet) => bet.selections.map((selection) => selection.fixture.id)))];
  const fixtures: Fixture[] = [];
  for (const id of ids) {
    const response = await getApiFootballClient().get<ApiFootballFixturesResponse>("/fixtures", { id });
    fixtures.push(...response.response);
  }
  await upsertFixtures(fixtures);
  const byId = new Map(fixtures.map((fixture) => [fixture.fixture.id, fixture]));
  let settled = 0;
  for (const bet of pendingBets) {
    const results = bet.selections.map((selection) => {
      const fixture = byId.get(selection.fixture.id);
      return fixture && settledStatuses.has(fixture.fixture.status.short) ? didBetSelectionWin(selection, fixture) : null;
    });
    if (results.some((result) => result === null)) continue;
    if (await settleBet(bet, results.every(Boolean) ? "won" : "lost", new Date().toISOString())) settled++;
  }
  return settled;
}
