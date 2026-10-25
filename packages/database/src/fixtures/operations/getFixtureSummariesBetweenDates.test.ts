import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixtureSummariesBetweenDates } from "./getFixtureSummariesBetweenDates.js";

describe("getFixtureSummariesBetweenDates", () => {
  it("selects only fixture summary fields", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });

    await getFixtureSummariesBetweenDates("2026-10-21", "2026-10-29");

    expect(mocks.find).toHaveBeenCalledWith(
      {
        "fixture.date": { $gte: "2026-10-21T00:00:00.000Z", $lt: "2026-10-29T00:00:00.000Z" },
      },
      {
        projection: {
          _id: 0,
          "fixture.id": 1,
          "fixture.timestamp": 1,
          "fixture.venue.name": 1,
          "fixture.venue.city": 1,
          "fixture.status.long": 1,
          "fixture.status.short": 1,
          "fixture.status.elapsed": 1,
          "league.id": 1,
          "league.name": 1,
          "league.country": 1,
          "league.logo": 1,
          "league.round": 1,
					"teams.home.id": 1,
          "teams.home.name": 1,
          "teams.home.logo": 1,
					"teams.away.id": 1,
          "teams.away.name": 1,
          "teams.away.logo": 1,
          "goals.home": 1,
          "goals.away": 1,
        },
      },
    );
  });
});
