export const scheduledSyncRunNames = [
  "daily",
  "hourly",
  "live",
  "three-hourly",
  "weekly",
] as const;

export type ScheduledSyncRunName = (typeof scheduledSyncRunNames)[number];

export type SyncRunState = {
  run: ScheduledSyncRunName;
  lastStartedAt: Date;
  lastCompletedAt?: Date;
  lastFailedAt?: Date;
  lastError?: string | null;
};
