import { describe, expect, it } from "vitest";
import {
  getBttsNoReferenceOdd,
  getBttsYesReferenceOdd,
  getOver0_5ReferenceOdd,
  getOver1_5ReferenceOdd,
  getOver2_5ReferenceOdd,
  getOver3_5ReferenceOdd,
  getUnder1_5ReferenceOdd,
  getUnder2_5ReferenceOdd,
  getUnder3_5ReferenceOdd,
  matchesVenueScoringStrategy,
} from "./index.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";

describe("strategy index helpers", () => {
  const goalsOdds = [
    {
      name: " Goals Over/Under ",
      values: [
        { value: "Over 0.5", odd: "1.08" },
        { value: "Over 1.5", odd: "1.2" },
        { value: "Over 2.5", odd: "1.7" },
        { value: "Over 3.5", odd: "2.2" },
        { value: "Under 1.5", odd: "3" },
        { value: "Under 2.5", odd: "1.7" },
        { value: "Under 3.5", odd: "1.3" },
      ],
    },
  ];

  it.each([
    [getOver0_5ReferenceOdd, 1.08],
    [getOver1_5ReferenceOdd, 1.2],
    [getOver2_5ReferenceOdd, 1.7],
    [getOver3_5ReferenceOdd, 2.2],
    [getUnder1_5ReferenceOdd, 3],
    [getUnder2_5ReferenceOdd, 1.7],
    [getUnder3_5ReferenceOdd, 1.3],
  ])("reads a valid goals reference odd", (getReferenceOdd, expected) => {
    expect(getReferenceOdd(goalsOdds)).toBe(expected);
    expect(
      getReferenceOdd([
        { name: "Goals Over/Under", values: [{ value: "Over 2.5", odd: "1" }] },
      ]),
    ).toBeNull();
  });

  it("reads BTTS odds and rejects invalid values", () => {
    const odds = [
      {
        name: "Both Teams Score",
        values: [
          { value: "Yes", odd: "1.7" },
          { value: "No", odd: "1.8" },
        ],
      },
    ];
    expect(getBttsYesReferenceOdd(odds)).toBe(1.7);
    expect(getBttsNoReferenceOdd(odds)).toBe(1.8);
    expect(getBttsYesReferenceOdd([])).toBeNull();
  });

  it("requires both venue scoring averages to meet the threshold", () => {
    expect(
      matchesVenueScoringStrategy(
        strategySnapshot({ homeGoalsFor: 1.5, awayGoalsFor: 1.5 }),
      ),
    ).toBe(true);
    expect(
      matchesVenueScoringStrategy(strategySnapshot({ awayGoalsFor: 1.4 })),
    ).toBe(false);
    expect(
      matchesVenueScoringStrategy(strategySnapshot({ homePlayed: 0 })),
    ).toBe(false);
  });
});
