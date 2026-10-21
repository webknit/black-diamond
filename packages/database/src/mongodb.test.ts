import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  db: vi.fn(),
  MongoClient: vi.fn(),
}));

vi.mock("mongodb", () => ({ MongoClient: mocks.MongoClient }));

import { configureDatabase, getDatabase } from "./mongodb.js";

describe("database configuration", () => {
  it("uses an explicitly configured connection instead of the host process environment", async () => {
    const database = { collection: vi.fn() };
    mocks.MongoClient.mockImplementation(function MongoClient() {
      return { connect: mocks.connect, db: mocks.db };
    });
    mocks.db.mockReturnValue(database);

    configureDatabase({ connectionString: "mongodb://example.test", databaseName: "black-diamond" });

    await expect(getDatabase()).resolves.toBe(database);
    expect(() =>
      configureDatabase({ connectionString: "mongodb://example.test", databaseName: "black-diamond" }),
    ).not.toThrow();
    expect(mocks.MongoClient).toHaveBeenCalledWith("mongodb://example.test");
    expect(mocks.db).toHaveBeenCalledWith("black-diamond");
  });
});
