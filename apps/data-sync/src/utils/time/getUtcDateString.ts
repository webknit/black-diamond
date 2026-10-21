export function getUtcDateString(now: Date, dayOffset = 0) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + dayOffset);

  return date.toISOString().slice(0, 10);
}
