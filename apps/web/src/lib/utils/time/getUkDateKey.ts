const ukTimeZone = 'Europe/London';

export function getUkDateKey(date: Date): string {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: ukTimeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(date);
	const value = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((part) => part.type === type)?.value;

	return `${value('year')}-${value('month')}-${value('day')}`;
}
