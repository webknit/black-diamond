import type { FixtureOdds } from "../types/fixtureOdds.js";
import type { FixtureStatsSnapshot } from "../types/fixtureStatsSnapshot.js";
export {
  teamFilterVariations,
  type TeamFilterVariation,
} from "./strategies.js";
export { botdStrategies } from "./botdStrategies.js";
export {
  bttsStrategyVariations,
  matchesBttsStrategyVariation,
  type BttsStrategyVariation,
} from "./bttsStrategies.js";
export {
  bttnsStrategyVariations,
  matchesBttnsStrategyVariation,
  type BttnsStrategyVariation,
} from "./bttnsStrategies.js";
export {
  over2_5RateStrategyVariations,
  matchesOver2_5RateStrategyVariation,
  type Over2_5RateStrategyVariation,
} from "./over2_5RateStrategies.js";
export {
  matchesOver1_5StrategyVariation,
  over1_5StrategyVariations,
  type Over1_5StrategyVariation,
} from "./over1_5Strategies.js";
export {
  leagueRateStrategyVariations,
  matchesLeagueRateStrategyVariation,
  type LeagueRateContext,
  type LeagueRateMarket,
  type LeagueRateStrategyVariation,
} from "./leagueRateStrategies.js";
export {
  getStrategyOddsRangeIds,
  over1_5OddsRanges,
  over2_5OddsRanges,
  strategyOddsRanges,
  type StrategyOddsFilter,
  type StrategyOddsRangeId,
} from "./strategyOddsRanges.js";
import type { TeamFilterVariation } from "./strategies.js";

type OddsMarket = Pick<FixtureOdds["odds"][number], "name" | "values">;

export function getOver2_5ReferenceOdd(odds: ReadonlyArray<OddsMarket>): number | null {
  const market = odds.find((item) => ["goals over/under", "goals over under"].includes(item.name.trim().toLowerCase()));
  const odd = Number(market?.values.find((item) => item.value.trim().toLowerCase() === "over 2.5")?.odd);
  return Number.isFinite(odd) && odd > 1 ? odd : null;
}

export function getOver1_5ReferenceOdd(odds: ReadonlyArray<OddsMarket>): number | null {
  const market = odds.find((item) => ["goals over/under", "goals over under"].includes(item.name.trim().toLowerCase()));
  const odd = Number(market?.values.find((item) => item.value.trim().toLowerCase() === "over 1.5")?.odd);
  return Number.isFinite(odd) && odd > 1 ? odd : null;
}

export function getBttsYesReferenceOdd(odds: ReadonlyArray<OddsMarket>): number | null {
  const market = odds.find((item) => item.name.trim().toLowerCase() === "both teams score");
  const odd = Number(market?.values.find((item) => item.value.trim().toLowerCase() === "yes")?.odd);
  return Number.isFinite(odd) && odd > 1 ? odd : null;
}

export function getBttsNoReferenceOdd(odds: ReadonlyArray<OddsMarket>): number | null {
  const market = odds.find((item) => item.name.trim().toLowerCase() === "both teams score");
  const odd = Number(market?.values.find((item) => item.value.trim().toLowerCase() === "no")?.odd);
  return Number.isFinite(odd) && odd > 1 ? odd : null;
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
