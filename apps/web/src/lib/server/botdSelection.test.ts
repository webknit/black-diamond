import { describe, expect, it } from "vitest";
import { chooseFixtureCandidates, diversifyTopCandidates, type BotdCandidate } from "./botdSelection.js";

function candidate(overrides: Partial<BotdCandidate> = {}): BotdCandidate {
  return {
    fixtureId: 1,
    leagueId: 39,
    strategyId: "under3_5-base",
    market: "under3_5",
    marketLabel: "Under 3.5",
    strategyTitle: "Base",
    referenceOdd: 1.5,
    evidenceScope: "leagueOnly",
    tier: "highConfidence",
    leaguePerformance: { bets: 100, wins: 70, losses: 30, profit: 20 },
    ...overrides,
  };
}

describe("BotD selection", () => {
  it("prefers team-specific evidence over a league-only strategy for the same fixture", () => {
    const selected = chooseFixtureCandidates([
      candidate(),
      candidate({ strategyId: "under3_5-rate80-last5", evidenceScope: "teamFiltered", tier: "eligible" }),
    ]);

    expect(selected).toHaveLength(1);
    expect(selected[0]?.strategyId).toBe("under3_5-rate80-last5");
  });

  it("keeps one league-only market trend and at most two picks from one league", () => {
    const selected = diversifyTopCandidates([
      candidate({ fixtureId: 1 }),
      candidate({ fixtureId: 2 }),
      candidate({ fixtureId: 3, strategyId: "under3_5-rate80-last5", evidenceScope: "teamFiltered" }),
      candidate({ fixtureId: 4, strategyId: "under3_5-rate60-last5", evidenceScope: "teamFiltered" }),
      candidate({ fixtureId: 5, leagueId: 140, strategyId: "btts-rate60-last5", market: "btts", evidenceScope: "teamFiltered" }),
    ]);

    expect(selected.map((item) => item.fixtureId)).toEqual([1, 3, 5]);
  });
});
