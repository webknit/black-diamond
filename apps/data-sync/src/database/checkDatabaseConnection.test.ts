import { describe, expect, it, vi } from "vitest";

const command = vi.fn();
const getDatabase = vi.hoisted(() => vi.fn());

vi.mock("@black-diamond/database/mongodb", () => ({ getDatabase }));

import { checkDatabaseConnection } from "./checkDatabaseConnection.js";

describe("checkDatabaseConnection", () => {
  it("pings MongoDB and returns its database name", async () => {
    getDatabase.mockResolvedValue({ databaseName: "black-diamond", command });

    await expect(checkDatabaseConnection()).resolves.toBe("black-diamond");
    expect(command).toHaveBeenCalledWith({ ping: 1 });
  });
});
