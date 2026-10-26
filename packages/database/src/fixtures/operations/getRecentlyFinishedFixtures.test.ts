import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), sort: vi.fn(), limit: vi.fn(), toArray: vi.fn(), getDatabase: vi.fn() }));
vi.mock('../../mongodb.js', () => ({ getDatabase: mocks.getDatabase }));

import { getRecentlyFinishedFixtures } from './getRecentlyFinishedFixtures.js';

describe('getRecentlyFinishedFixtures', () => {
	it('finds a bounded set of recently completed fixtures', async () => {
		mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
		mocks.collection.mockReturnValue({ find: mocks.find });
		mocks.find.mockReturnValue({ sort: mocks.sort });
		mocks.sort.mockReturnValue({ limit: mocks.limit });
		mocks.limit.mockReturnValue({ toArray: mocks.toArray });
		mocks.toArray.mockResolvedValue([]);

		await getRecentlyFinishedFixtures(new Date('2026-10-26T12:00:00Z'));

		expect(mocks.find).toHaveBeenCalledWith({
			'fixture.timestamp': { $gte: 1792843200, $lte: 1793016000 },
			'fixture.status.short': { $in: ['FT', 'AET', 'PEN'] }
		});
		expect(mocks.sort).toHaveBeenCalledWith({ 'fixture.timestamp': -1 });
		expect(mocks.limit).toHaveBeenCalledWith(20);
	});
});
