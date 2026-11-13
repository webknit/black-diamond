import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import { syncTeamStatsForLeague } from "../sync/teamStats/syncTeamStatsForLeague";
import { logSyncStep } from "../utils/logging/logSyncStep";

export async function runWeeklySync() {
  for (const league of selectedLeagues) {
    await logSyncStep(`sync team stats for ${league.name}`, () =>
      syncTeamStatsForLeague(league.id),
    );
  }
}
