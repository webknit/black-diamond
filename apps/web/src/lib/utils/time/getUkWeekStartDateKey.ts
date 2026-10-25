import { getUkDateKey } from './getUkDateKey.js';

export function getUkWeekStartDateKey(date: Date) {
	const dateKey = getUkDateKey(date);
	const utcDate = new Date(`${dateKey}T00:00:00.000Z`);
	const daysSinceMonday = (utcDate.getUTCDay() + 6) % 7;
	utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceMonday);
	return utcDate.toISOString().slice(0, 10);
}
