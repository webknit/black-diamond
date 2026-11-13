import { describe, expect, it, vi } from "vitest";

vi.mock("./strategies.js", () => ({
  teamFilterVariations: [
    { id: "team-filter", title: "Team filter", description: "Team description", sample: "last5" },
    { id: "excluded-team-filter", title: "Excluded", description: "Excluded description", sample: "last3" },
  ],
  matchesTeamFilterVariation: vi.fn(() => true),
}));
vi.mock("./over2_5RateStrategies.js", () => ({
  over2_5RateStrategyVariations: [{ id: "over2-rate", title: "Over 2 rate", description: "Over 2 rate description" }],
  matchesOver2_5RateStrategyVariation: vi.fn(() => true),
}));
vi.mock("./over3_5Strategies.js", () => ({
  over3_5StrategyVariations: [{ id: "over3", title: "Over 3", description: "Over 3 description" }],
  matchesOver3_5StrategyVariation: vi.fn(() => true),
}));
vi.mock("./under2_5Strategies.js", () => ({
  under2_5StrategyVariations: [{ id: "under2", title: "Under 2", description: "Under 2 description" }],
  matchesUnder2_5StrategyVariation: vi.fn(() => true),
}));
vi.mock("./under3_5Strategies.js", () => ({
  under3_5StrategyVariations: [{ id: "under3", title: "Under 3", description: "Under 3 description" }],
  matchesUnder3_5StrategyVariation: vi.fn(() => true),
}));
vi.mock("./under1_5Strategies.js", () => ({
  under1_5StrategyVariations: [{ id: "under1", title: "Under 1", description: "Under 1 description" }],
  matchesUnder1_5StrategyVariation: vi.fn(() => true),
}));
vi.mock("./over0_5Strategies.js", () => ({
  over0_5StrategyVariations: [{ id: "over0", title: "Over 0", description: "Over 0 description" }],
  matchesOver0_5StrategyVariation: vi.fn(() => true),
}));
vi.mock("./over1_5Strategies.js", () => ({
  over1_5StrategyVariations: [{ id: "over1", title: "Over 1", description: "Over 1 description" }],
  matchesOver1_5StrategyVariation: vi.fn(() => true),
}));
vi.mock("./bttsStrategies.js", () => ({
  bttsStrategyVariations: [
    { id: "btts", title: "BTTS", description: "BTTS description", sample: "last5" },
    { id: "excluded-btts", title: "Excluded", description: "Excluded description", sample: "last3" },
  ],
  matchesBttsStrategyVariation: vi.fn(() => true),
}));
vi.mock("./bttnsStrategies.js", () => ({
  bttnsStrategyVariations: [{ id: "bttns", title: "BTNTS", description: "BTNTS description" }],
  matchesBttnsStrategyVariation: vi.fn(() => true),
}));
vi.mock("./leagueRateStrategies.js", () => ({
  leagueRateStrategyVariations: [{ id: "league-rate", title: "League rate", description: "League rate description", market: "under2_5" }],
  matchesLeagueRateStrategyVariation: vi.fn(() => true),
}));

import {
  botdStrategies,
  getBotdMarketLabel,
  getBotdReferenceOdd,
  matchesBotdStrategy,
} from "./botdStrategies.js";

describe("BOTD strategies", () => {
  it("builds labelled strategies from every supported variation family", () => {
    expect(botdStrategies).toHaveLength(11);
    expect(botdStrategies.map((strategy) => strategy.id)).toEqual([
      "team-filter", "over2-rate", "over3", "under2", "under3", "under1",
      "over0", "over1", "btts", "bttns", "league-rate",
    ]);
    expect(botdStrategies.map((strategy) => strategy.market)).toEqual([
      "over2_5", "over2_5", "over3_5", "under2_5", "under3_5", "under1_5",
      "over0_5", "over1_5", "btts", "bttns", "under2_5",
    ]);
    expect(botdStrategies.every((strategy) => strategy.title.includes(" · "))).toBe(true);
    expect(botdStrategies.every((strategy) => strategy.description.startsWith("Bet: "))).toBe(true);
    expect(botdStrategies.find((strategy) => strategy.id === "excluded-team-filter")).toBeUndefined();
    expect(botdStrategies.find((strategy) => strategy.id === "excluded-btts")).toBeUndefined();
  });

  it("dispatches every known strategy and rejects unknown or context-less league strategies", () => {
    for (const strategy of botdStrategies.filter((strategy) => strategy.id !== "league-rate")) {
      expect(matchesBotdStrategy({} as never, undefined, strategy)).toBe(true);
    }

    const leagueStrategy = botdStrategies.find((strategy) => strategy.id === "league-rate")!;
    expect(matchesBotdStrategy({} as never, undefined, leagueStrategy)).toBe(false);
    expect(matchesBotdStrategy({} as never, {} as never, leagueStrategy)).toBe(true);
    expect(matchesBotdStrategy({} as never, {} as never, {
      id: "unknown", title: "Unknown", description: "Unknown", market: "over2_5",
    })).toBe(false);
  });

  it.each([
    ["over2_5", "Over 2.5"], ["over3_5", "Over 3.5"], ["under3_5", "Under 3.5"],
    ["under2_5", "Under 2.5"], ["over1_5", "Over 1.5"], ["under1_5", "Under 1.5"],
    ["over0_5", "Over 0.5"], ["btts", "BTTS"], ["bttns", "BTNTS"],
  ] as const)("labels %s as %s", (market, label) => {
    expect(getBotdMarketLabel(market)).toBe(label);
  });

  it.each([
    ["over2_5", "Over 2.5", 1.7], ["over3_5", "Over 3.5", 2.2],
    ["under3_5", "Under 3.5", 1.3], ["under2_5", "Under 2.5", 1.7],
    ["over1_5", "Over 1.5", 1.2], ["under1_5", "Under 1.5", 3],
    ["over0_5", "Over 0.5", 1.08], ["btts", "Yes", 1.7], ["bttns", "No", 1.7],
  ] as const)("reads the %s reference odd", (market, selection, expected) => {
    const odds = [
      {
        name: " Goals Over Under ",
        values: [["Over 2.5", 1.7], ["Over 3.5", 2.2], ["Under 3.5", 1.3], ["Under 2.5", 1.7], ["Over 1.5", 1.2], ["Under 1.5", 3], ["Over 0.5", 1.08]]
          .map(([value, odd]) => ({ value: String(value), odd: String(odd) })),
      },
      { name: "Both Teams Score", values: [{ value: "Yes", odd: "1.7" }, { value: "No", odd: "1.7" }] },
    ];
    expect(getBotdReferenceOdd(odds, market)).toBe(expected);
    expect(selection).toBeTruthy();
  });

  it("rejects missing, invalid, and non-bettable reference odds", () => {
    expect(getBotdReferenceOdd([], "over2_5")).toBeNull();
    expect(getBotdReferenceOdd([{ name: "Goals Over/Under", values: [{ value: "Over 2.5", odd: "1" }] }], "over2_5")).toBeNull();
    expect(getBotdReferenceOdd([{ name: "Both Teams Score", values: [{ value: "Yes", odd: "not-a-number" }] }], "btts")).toBeNull();
  });
});
