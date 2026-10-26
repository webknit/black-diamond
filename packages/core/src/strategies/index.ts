import type { FixtureOdds } from "../types/fixtureOdds.js";
import type { FixtureStatsSnapshot } from "../types/fixtureStatsSnapshot.js";
export {
  strategyDetails,
  teamFilterVariations,
  type StrategyDetails,
  type StrategyId,
  type TeamFilterVariation,
} from "./strategies.js";
import type { TeamFilterVariation } from "./strategies.js";

type OddsMarket = Pick<FixtureOdds["odds"][number], "name" | "values">;

export function getOver2_5ReferenceOdd(odds: ReadonlyArray<OddsMarket>): number | null {
  const market = odds.find((item) => ["goals over/under", "goals over under"].includes(item.name.trim().toLowerCase()));
  const odd = Number(market?.values.find((item) => item.value.trim().toLowerCase() === "over 2.5")?.odd);
  return Number.isFinite(odd) && odd > 1 ? odd : null;
}

export function matchesOver2_5LeagueAverageStrategy(snapshot: FixtureStatsSnapshot, leagueOver2_5Percentage: number | null) {
  return leagueOver2_5Percentage !== null && snapshot.home.summary.over2_5.percentage > leagueOver2_5Percentage && snapshot.away.summary.over2_5.percentage > leagueOver2_5Percentage;
}
function average(goals: number, played: number) { return played === 0 ? null : goals / played; }
export function matchesVenueScoringStrategy(snapshot: FixtureStatsSnapshot, minimumGoalsPerFixture = 1.5) {
  const home = snapshot.home.fixtures.home;
  const away = snapshot.away.fixtures.away;
  return (average(home.goalsFor, home.played) ?? -Infinity) >= minimumGoalsPerFixture && (average(away.goalsFor, away.played) ?? -Infinity) >= minimumGoalsPerFixture;
}
function isExcluded(values: Array<number | null>, threshold: number, mode: TeamFilterVariation["exclusionMode"]) {
  if (values.some((value) => value === null)) return true;
  const below = values.map((value) => value! < threshold);
  return mode === "eitherTeam" ? below.some(Boolean) : below.every(Boolean);
}
export function matchesTeamFilterVariation(snapshot: FixtureStatsSnapshot, variation: TeamFilterVariation) {
  const home = variation.sample === "last5" ? snapshot.home.last5Venue : snapshot.home.fixtures.home;
  const away = variation.sample === "last5" ? snapshot.away.last5Venue : snapshot.away.fixtures.away;
  if (!home || !away) return false;
  const scoring = [average(home.goalsFor, home.played), average(away.goalsFor, away.played)];
  const defensive = [average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)];
  return !((variation.scoringThreshold !== undefined && isExcluded(scoring, variation.scoringThreshold, variation.exclusionMode)) || (variation.defensiveThreshold !== undefined && isExcluded(defensive, variation.defensiveThreshold, variation.exclusionMode)));
}
