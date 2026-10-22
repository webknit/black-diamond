import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getDatabase: vi.fn(), collection: vi.fn(), find: vi.fn(), sort: vi.fn(), toArray: vi.fn() }));
vi.mock("../../mongodb.js", () => ({ getDatabase: mocks.getDatabase }));
import { getBetsByAccountId } from "./getBetsByAccountId.js";
describe("getBetsByAccountId", () => {
  it("reads an account's bets newest first without Mongo IDs", async () => {
    mocks.getDatabase.mockResolvedValue({ collection: mocks.collection }); mocks.collection.mockReturnValue({ find: mocks.find }); mocks.find.mockReturnValue({ sort: mocks.sort }); mocks.sort.mockReturnValue({ toArray: mocks.toArray }); mocks.toArray.mockResolvedValue([]);
    await getBetsByAccountId("main");
    expect(mocks.find).toHaveBeenCalledWith({ accountId: "main" }, { projection: { _id: 0 } }); expect(mocks.sort).toHaveBeenCalledWith({ placedAt: -1 });
  });
});
