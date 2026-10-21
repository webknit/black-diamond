import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixturesBefore } from "./getFixturesBefore.js";

describe("getFixturesBefore", () => {
  it("returns only earlier completed fixtures in the league and season", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });
    await getFixturesBefore(39, 2026, 12345);
    expect(mocks.find).toHaveBeenCalledWith({
      "league.id": 39,
      "league.season": 2026,
      "fixture.timestamp": { $lt: 12345 },
      "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
    });
  });
});
