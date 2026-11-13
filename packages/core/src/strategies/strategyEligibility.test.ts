import { describe, expect, it } from "vitest";
import { minimumStrategyBetsForRanking } from "./strategyEligibility.js";

describe("strategy eligibility", () => {
  it("requires 100 bets before ranking a strategy", () => {
    expect(minimumStrategyBetsForRanking).toBe(100);
  });
});
