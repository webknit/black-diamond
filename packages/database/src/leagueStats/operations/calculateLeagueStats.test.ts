import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  aggregate: vi.fn(),
  collection: vi.fn(),
  getDatabase: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));

import { calculateLeagueStats } from "./calculateLeagueStats.js";

describe("calculateLeagueStats", () => {
  it("calculates counts and percentages from completed fixtures", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ aggregate: mocks.aggregate });
    mocks.aggregate.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue([
      {
        fixturesPlayed: 10,
        homeWins: 5,
        awayWins: 3,
        draws: 2,
        totalGoals: 27,
        homeGoals: 16,
        awayGoals: 11,
        btts: 6,
        over0_5: 10,
        over1_5: 8,
        over2_5: 5,
        under0_5: 0,
        under1_5: 2,
        under2_5: 5,
      },
    ]);

    await expect(
      calculateLeagueStats({
        id: 39,
        name: "Premier League",
        country: "England",
        season: 2026,
      }),
    ).resolves.toMatchObject({
      fixturesPlayed: 10,
      results: { homeWins: { count: 5, percentage: 50 } },
      goals: { total: 27, averagePerFixture: 2.7 },
      btts: { count: 6, percentage: 60 },
      over2_5: { count: 5, percentage: 50 },
      under1_5: { count: 2, percentage: 20 },
    });
    expect(mocks.collection).toHaveBeenCalledWith("fixtures");
    expect(mocks.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $match: expect.objectContaining({
            "league.id": 39,
            "league.season": 2026,
            "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
          }),
        }),
      ]),
    );
  });
});
