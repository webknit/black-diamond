import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getFixturesBetweenDates: vi.fn(), syncPrediction: vi.fn() }));
vi.mock("@black-diamond/database/fixtures", () => ({ getFixturesBetweenDates: mocks.getFixturesBetweenDates }));
vi.mock("./syncPrediction.js", () => ({ syncPrediction: mocks.syncPrediction }));
import { syncUpcomingPredictions } from "./syncUpcomingPredictions.js";

describe("syncUpcomingPredictions", () => {
  it("syncs predictions for the next seven days of fixtures", async () => {
    mocks.getFixturesBetweenDates.mockResolvedValue([{ fixture: { id: 1 } }, { fixture: { id: 2 } }]);
    await syncUpcomingPredictions(new Date("2026-10-21T12:00:00.000Z"));
    expect(mocks.getFixturesBetweenDates).toHaveBeenCalledWith("2026-10-21", "2026-10-29");
    expect(mocks.syncPrediction).toHaveBeenCalledWith(1);
    expect(mocks.syncPrediction).toHaveBeenCalledWith(2);
  });
});
