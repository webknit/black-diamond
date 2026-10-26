import { upsertFixtureLineups } from "@black-diamond/database/fixtureLineups";
import { getApiFootballClient } from "../../providers/api-football/client/apiFootball.js";
import type { ApiFootballFixtureLineupsResponse } from "../../providers/api-football/types/fixtureLineups.js";

export async function syncFixtureLineups(fixtureIds: number[]): Promise<number> {
  const apiFootball = getApiFootballClient();

  for (const fixtureId of fixtureIds) {
    const response = await apiFootball.get<ApiFootballFixtureLineupsResponse>("/fixtures/lineups", {
      fixture: fixtureId,
    });

    await upsertFixtureLineups({
      fixtureId,
      lineups: response.response.map((lineup) => ({
        teamId: lineup.team.id,
        formation: lineup.formation,
        coach: lineup.coach ? { name: lineup.coach.name } : null,
        startXI: lineup.startXI.map(({ player }) => ({
          id: player.id,
          name: player.name,
          number: player.number,
          position: player.pos,
        })),
      })),
      syncedAt: new Date().toISOString(),
    });
  }

  return fixtureIds.length;
}
