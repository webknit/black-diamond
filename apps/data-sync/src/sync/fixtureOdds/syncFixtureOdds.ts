import { upsertFixtureOdds } from "@black-diamond/database/fixtureOdds";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";

const preferredBookmakers = [
  { id: 8, name: "Bet365" as const },
  { id: 3, name: "Betfair" as const },
];

export async function syncFixtureOdds(fixtureId: number) {
  const response = await getApiFootballClient().get<{ response: Array<{ bookmakers: Array<{ id: number; bets: Array<{ id: number; name: string; values: Array<{ value: string; odd: string }> }> }> }> }>("/odds", { fixture: fixtureId });
  const bookmakers = response.response[0]?.bookmakers ?? [];
  const source = preferredBookmakers.find((bookmaker) => bookmakers.some((item) => item.id === bookmaker.id));
  if (!source) return;
  const bookmaker = bookmakers.find((item) => item.id === source.id)!;
  await upsertFixtureOdds({ fixtureId, source: source.name, odds: bookmaker.bets, syncedAt: new Date().toISOString() });
}
