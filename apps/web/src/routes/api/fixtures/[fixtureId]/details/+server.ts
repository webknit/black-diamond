import { error, json } from '@sveltejs/kit';
import { getFixtureEventsForFixtures } from '@black-diamond/database/fixtureEvents';
import { getFixtureStatisticsForFixtures } from '@black-diamond/database/fixtureStatistics';

export async function GET({ params }: { params: { fixtureId: string } }) {
	const fixtureId = Number(params.fixtureId);
	if (!Number.isSafeInteger(fixtureId) || fixtureId <= 0) throw error(400, 'Invalid fixture.');

	const [events, statistics] = await Promise.all([
		getFixtureEventsForFixtures([fixtureId]).then((items) => items[0]?.events ?? []),
		getFixtureStatisticsForFixtures([fixtureId]).then((items) => items[0] ?? null)
	]);

	return json({
		events,
		statistics: statistics ? { home: statistics.home, away: statistics.away } : null
	});
}
