import { describe, expect, it } from "vitest";

import { getUtcDateString } from "./getUtcDateString.js";

describe("getUtcDateString", () => {
  it("formats a date in UTC and supports day offsets", () => {
    const date = new Date("2026-10-21T00:30:00+01:00");

    expect(getUtcDateString(date)).toBe("2026-10-20");
    expect(getUtcDateString(date, 1)).toBe("2026-10-21");
  });
});
