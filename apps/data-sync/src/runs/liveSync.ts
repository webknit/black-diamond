import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";

export async function runLiveSync() {
  await syncFixturesInProgress();
}
