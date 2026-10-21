import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), getApiFootballClient: vi.fn(), upsertPrediction: vi.fn() }));
vi.mock("@black-diamond/database/predictions", () => ({ upsertPrediction: mocks.upsertPrediction }));
vi.mock("../../providers/api-football/client/apiFootball.js", () => ({ getApiFootballClient: mocks.getApiFootballClient }));
import { syncPrediction } from "./syncPrediction.js";

describe("syncPrediction", () => {
  it("stores the API response under its fixture ID", async () => {
    const response = { predictions: { advice: "Home win" } };
    mocks.getApiFootballClient.mockReturnValue({ get: mocks.get });
    mocks.get.mockResolvedValue({ response: [response] });
    await syncPrediction(123);
    expect(mocks.get).toHaveBeenCalledWith("/predictions", { fixture: 123 });
    expect(mocks.upsertPrediction).toHaveBeenCalledWith({ fixtureId: 123, response });
  });

  it("does not write when the API returns no prediction", async () => {
    mocks.getApiFootballClient.mockReturnValue({ get: mocks.get });
    mocks.get.mockResolvedValue({ response: [] });
    await syncPrediction(123);
    expect(mocks.upsertPrediction).not.toHaveBeenCalled();
  });
});
