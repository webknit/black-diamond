export async function logSyncStep<T>(name: string, sync: () => Promise<T>): Promise<T> {
  console.info(`[data-sync] Starting: ${name}`);
  const startedAt = Date.now();

  try {
    const result = await sync();
    const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.info(`[data-sync] Finished: ${name} (${durationSeconds}s)`);
    return result;
  } catch (error) {
    const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.error(`[data-sync] Failed: ${name} (${durationSeconds}s)`, error);
    throw error;
  }
}
