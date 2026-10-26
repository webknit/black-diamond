import type { Fixture } from '@black-diamond/core/fixture';
import { getDatabase } from '../../mongodb.js';

const finishedStatuses = ['FT', 'AET', 'PEN'];

export async function getRecentlyFinishedFixtures(now = new Date(), limit = 20): Promise<Fixture[]> {
	const database = await getDatabase();
	const nowTimestamp = Math.floor(now.getTime() / 1000);
	const fortyEightHoursAgoTimestamp = nowTimestamp - 48 * 60 * 60;

	return database
		.collection<Fixture>('fixtures')
		.find({
			'fixture.timestamp': { $gte: fortyEightHoursAgoTimestamp, $lte: nowTimestamp },
			'fixture.status.short': { $in: finishedStatuses }
		})
		.sort({ 'fixture.timestamp': -1 })
		.limit(limit)
		.toArray();
}
