import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), getDatabase: vi.fn(), updateOne: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { upsertPrediction } from "./upsertPrediction.js";

describe("upsertPrediction", () => {
  it("upserts a prediction by fixture ID", async () => {
    const prediction = { fixtureId: 123, response: { predictions: {} } };
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection });
    mocks.collection.mockReturnValue({ updateOne: mocks.updateOne });
    await upsertPrediction(prediction);
    expect(mocks.collection).toHaveBeenCalledWith("predictions");
    expect(mocks.updateOne).toHaveBeenCalledWith({ fixtureId: 123 }, { $set: prediction }, { upsert: true });
  });
});
