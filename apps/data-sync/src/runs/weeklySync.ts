import { selectedLeagues } from "../config/selectedLeagues.js";
import { syncTeamStatsForLeague } from "../sync/teamStats/syncTeamStatsForLeague.js";
import { logSyncStep } from "../utils/logSyncStep.js";

export async function runWeeklySync() {
  for (const league of selectedLeagues) {
    await logSyncStep(`sync team stats for ${league.name}`, () =>
      syncTeamStatsForLeague(league.id),
    );
  }
}
