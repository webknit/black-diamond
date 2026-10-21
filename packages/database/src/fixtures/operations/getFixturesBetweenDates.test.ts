import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), find: vi.fn(), getDatabase: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getFixturesBetweenDates } from "./getFixturesBetweenDates.js";

describe("getFixturesBetweenDates", () => {
  it("finds fixtures inside the UTC date window", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ find: mocks.find });
    mocks.find.mockReturnValue({ toArray: mocks.toArray });
    await getFixturesBetweenDates("2026-10-21", "2026-10-29");
    expect(mocks.find).toHaveBeenCalledWith({
      "fixture.date": { $gte: "2026-10-21T00:00:00.000Z", $lt: "2026-10-29T00:00:00.000Z" },
    });
  });
});
