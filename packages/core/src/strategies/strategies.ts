export type TeamFilterVariation = {
  id: string;
  title: string;
  description: string;
  scoringThreshold?: number;
  defensiveThreshold?: number;
  exclusionMode: "eitherTeam" | "bothTeams";
  sample: "last5" | "season";
};

function modeLabel(mode: TeamFilterVariation["exclusionMode"]) {
  return mode === "eitherTeam" ? "Both teams" : "At least one team";
}

function createVariation(
  scoringThreshold: number | undefined,
  defensiveThreshold: number | undefined,
  exclusionMode: TeamFilterVariation["exclusionMode"],
  sample: TeamFilterVariation["sample"],
): TeamFilterVariation {
  const filterId = [
    scoringThreshold === undefined ? null : `score${scoringThreshold}`,
    defensiveThreshold === undefined ? null : `defend${defensiveThreshold}`,
  ].filter(Boolean).join("-");
  const requirements = [
    scoringThreshold === undefined ? null : `${modeLabel(exclusionMode)}: score >= ${scoringThreshold}`,
    defensiveThreshold === undefined ? null : `${modeLabel(exclusionMode)}: concede >= ${defensiveThreshold}`,
  ].filter((filter): filter is string => filter !== null);

  const sampleLabel = sample === "last5" ? "last 5 venue matches" : "season venue matches";
  return {
    id: `${filterId}-${exclusionMode}-${sample}`,
    title: sample === "last5" ? requirements.join(" · ") : `${requirements.join(" · ")} · season`,
    description: `${sampleLabel} must meet: ${requirements.join("; ")}.`,
    scoringThreshold,
    defensiveThreshold,
    exclusionMode,
    sample,
  };
}

const thresholds = [1.3, 1.5, 1.7] as const;

export const teamFilterVariations: TeamFilterVariation[] = [
  {
    id: "noTeamFilters",
    title: "Base · no team filters",
    description: "Every fixture with a stored pre-match Over 2.5 price above the odds floor.",
    exclusionMode: "eitherTeam",
    sample: "season",
  },
  // Recent form is listed first because it is the primary filter set in BOTD.
  ...thresholds.flatMap((threshold) =>
    (["eitherTeam", "bothTeams"] as const).map((mode) =>
      createVariation(threshold, undefined, mode, "last5"),
    ),
  ),
  ...thresholds.flatMap((threshold) =>
    (["eitherTeam", "bothTeams"] as const).map((mode) =>
      createVariation(undefined, threshold, mode, "last5"),
    ),
  ),
  ...thresholds.flatMap((scoring) =>
    thresholds.flatMap((defensive) =>
      (["eitherTeam", "bothTeams"] as const).map((mode) =>
        createVariation(scoring, defensive, mode, "last5"),
      ),
    ),
  ),
];
import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';


function average(goals: number, played: number) {
  return played === 0 ? null : goals / played;
}

function isExcluded(values: Array<number | null>, threshold: number, mode: TeamFilterVariation['exclusionMode']) {
  if (values.some((value) => value === null)) return true;
  const below = values.map((value) => value! < threshold);
  return mode === 'eitherTeam' ? below.some(Boolean) : below.every(Boolean);
}

export function matchesTeamFilterVariation(snapshot: FixtureStatsSnapshot, variation: TeamFilterVariation) {
  const home = variation.sample === 'last5' ? snapshot.home.last5Venue : snapshot.home.fixtures.home;
  const away = variation.sample === 'last5' ? snapshot.away.last5Venue : snapshot.away.fixtures.away;
  if (!home || !away) return false;
  const scoring = [average(home.goalsFor, home.played), average(away.goalsFor, away.played)];
  const defensive = [average(home.goalsAgainst, home.played), average(away.goalsAgainst, away.played)];
  return !((variation.scoringThreshold !== undefined && isExcluded(scoring, variation.scoringThreshold, variation.exclusionMode)) || (variation.defensiveThreshold !== undefined && isExcluded(defensive, variation.defensiveThreshold, variation.exclusionMode)));
}
