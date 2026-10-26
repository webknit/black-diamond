const ukTimeZone = "Europe/London";

export function getUkDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ukTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getUkWeekStartDateKey(date: Date): string {
  const dateKey = getUkDateKey(date);
  const utcDate = new Date(`${dateKey}T00:00:00.000Z`);
  utcDate.setUTCDate(utcDate.getUTCDate() - ((utcDate.getUTCDay() + 6) % 7));
  return utcDate.toISOString().slice(0, 10);
}
