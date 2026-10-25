import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collection: vi.fn(),
  find: vi.fn(),
  getDatabase: vi.fn(),
  sort: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { calculateLeagueStatsSnapshots } from "./calculateLeagueStatsSnapshots.js";

const fixture = (id: number, timestamp: number, round: string, home: number, away: number) => ({
  fixture: { id, timestamp, status: { short: "FT" } },
  league: { round },
  goals: { home, away },
});

describe("calculateLeagueStatsSnapshots", () => {
  it("builds cumulative snapshots through each round", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([
      fixture(1, 100, "Regular Season - 1", 2, 1),
      fixture(2, 200, "Regular Season - 1", 0, 0),
      fixture(3, 300, "Regular Season - 2", 1, 2),
    ]);

    const snapshots = await calculateLeagueStatsSnapshots({
      id: 39, name: "Premier League", country: "England", season: 2026,
    });

    expect(snapshots).toHaveLength(2);
    expect(snapshots[0]).toMatchObject({
      round: "Regular Season - 1",
      roundPhase: "Regular Season",
      roundNumber: 1,
      totalRoundsInPhase: 2,
      roundLastFixtureTimestamp: 200,
      fixturesPlayed: 2,
      over2_5: { count: 1, percentage: 50 },
    });
    expect(snapshots[1]).toMatchObject({
      round: "Regular Season - 2",
      roundLastFixtureTimestamp: 300,
      fixturesPlayed: 3,
      results: { awayWins: { count: 1, percentage: 33.33333333333333 } },
    });
    expect(snapshots[0].calculatedAt).toBeInstanceOf(Date);
  });
});
