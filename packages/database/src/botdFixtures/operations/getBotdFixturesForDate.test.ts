import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), sort: vi.fn(), toArray: vi.fn(), getDatabase: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getBotdFixturesForDate } from "./getBotdFixturesForDate.js";

describe("getBotdFixturesForDate", () => {
  it("filters by date, strategy and an optional odds floor", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ toArray: mocks.toArray });

    await getBotdFixturesForDate("2026-10-21", "score1.5-eitherTeam-last5", 1.7);

    expect(mocks.find).toHaveBeenCalledWith({
      fixtureDate: "2026-10-21",
      matchingStrategyIds: "score1.5-eitherTeam-last5",
      over2_5ReferenceOdd: { $gte: 1.7 },
    });
    expect(mocks.sort).toHaveBeenCalledWith({ fixtureId: 1 });
  });
});
