import { describe, expect, it } from "vitest";
import { matchesTeamFilterVariation, teamFilterVariations } from "./strategies.js";
import { strategySnapshot } from "../../test/strategyFixtures.js";
describe("team filter strategies", () => {
  it.each(teamFilterVariations)("accepts qualifying data for $id", (strategy) => expect(matchesTeamFilterVariation(strategySnapshot(), strategy)).toBe(true));
  it("rejects an incomplete sample and an excluded team", () => {
    const strategy = teamFilterVariations.find((item) => item.id === "score1.5-eitherTeam-last5")!;
    expect(matchesTeamFilterVariation(strategySnapshot({ homeGoalsFor: 1.4 }), strategy)).toBe(false);
    expect(matchesTeamFilterVariation({ home: { last5Venue: undefined }, away: { last5Venue: undefined } } as never, strategy)).toBe(false);
  });
});
