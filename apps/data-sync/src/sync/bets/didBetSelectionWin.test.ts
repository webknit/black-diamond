import { describe, expect, it } from "vitest";
import { didBetSelectionWin } from "./didBetSelectionWin.js";

const fixture = (home: number, away: number) => ({ score: { fulltime: { home, away } } }) as never;
const selection = (market: Record<string, unknown>) => ({ market }) as never;

describe("didBetSelectionWin", () => {
  it("settles match winner and double chance from the full-time score", () => {
    expect(didBetSelectionWin(selection({ type: "matchWinner", outcome: "home", line: null }), fixture(2, 1))).toBe(true);
    expect(didBetSelectionWin(selection({ type: "doubleChance", outcome: "drawAway", line: null }), fixture(1, 1))).toBe(true);
  });

  it("settles goal lines and both-teams-to-score", () => {
    expect(didBetSelectionWin(selection({ type: "goalsOverUnder", outcome: "over", line: 2.5 }), fixture(2, 1))).toBe(true);
    expect(didBetSelectionWin(selection({ type: "btts", outcome: "no", line: null }), fixture(1, 0))).toBe(true);
  });

  it("does not settle without a full-time score", () => {
    expect(didBetSelectionWin(selection({ type: "matchWinner", outcome: "home", line: null }), { score: { fulltime: { home: null, away: null } } } as never)).toBeNull();
  });
});
