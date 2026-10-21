import { syncUpcomingFixtureOdds } from "../sync/fixtureOdds/syncUpcomingFixtureOdds.js";
export async function runThreeHourlySync() { await syncUpcomingFixtureOdds(); }
