import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixtureCardSnapshots } from "./getFixtureCardSnapshots.js";

describe("getFixtureCardSnapshots", () => {
  it("selects only snapshot fields needed for fixture cards", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getFixtureCardSnapshots([10, 20]);

    expect(mocks.find).toHaveBeenCalledWith(
      { fixtureId: { $in: [10, 20] } },
      {
        projection: {
          _id: 0,
          fixtureId: 1,
          "home.leaguePosition": 1,
          "home.leagueTeams": 1,
          "home.form": 1,
          "home.formHome": 1,
          "home.fixtures.home.played": 1,
          "home.fixtures.home.wins": 1,
          "home.fixtures.home.draws": 1,
          "home.fixtures.home.loses": 1,
          "home.fixtures.home.goalsFor": 1,
          "home.fixtures.home.goalsAgainst": 1,
          "home.fixtures.away.goalsFor": 1,
          "home.fixtures.away.goalsAgainst": 1,
          "home.fixtures.total.played": 1,
          "home.fixtures.total.goalsFor": 1,
          "home.fixtures.total.goalsAgainst": 1,
          "home.cleanSheets.home": 1,
          "home.cleanSheets.away": 1,
          "home.cleanSheets.total": 1,
          "home.summary.wins.percentage": 1,
          "home.summary.draws.percentage": 1,
          "away.leaguePosition": 1,
          "away.leagueTeams": 1,
          "away.form": 1,
          "away.formAway": 1,
          "away.fixtures.home.goalsFor": 1,
          "away.fixtures.home.goalsAgainst": 1,
          "away.fixtures.away.played": 1,
          "away.fixtures.away.wins": 1,
          "away.fixtures.away.draws": 1,
          "away.fixtures.away.loses": 1,
          "away.fixtures.away.goalsFor": 1,
          "away.fixtures.away.goalsAgainst": 1,
          "away.fixtures.total.played": 1,
          "away.fixtures.total.goalsFor": 1,
          "away.fixtures.total.goalsAgainst": 1,
          "away.cleanSheets.home": 1,
          "away.cleanSheets.away": 1,
          "away.cleanSheets.total": 1,
          "away.summary.wins.percentage": 1,
          "away.summary.draws.percentage": 1,
        },
      },
    );
  });

  it("does not connect when there are no fixture IDs", async () => {
    await expect(getFixtureCardSnapshots([])).resolves.toEqual([]);
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});
