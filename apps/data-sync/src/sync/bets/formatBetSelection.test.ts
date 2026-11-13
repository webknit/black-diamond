import { describe, expect, it } from "vitest";

import { formatBetSelection } from "./formatBetSelection";

describe("formatBetSelection", () => {
  it("uses BTTS labels instead of API yes and no values", () => {
    expect(formatBetSelection({ type: "btts", outcome: "yes", selection: "Yes" } as never)).toBe("BTTS");
    expect(formatBetSelection({ type: "btts", outcome: "no", selection: "No" } as never)).toBe("BTNTS");
  });

  it("keeps an already-readable market selection", () => {
    expect(formatBetSelection({ type: "goalsOverUnder", outcome: "over", selection: "Over 2.5" } as never)).toBe("Over 2.5");
  });
});
