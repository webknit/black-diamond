export type StrategyId =
  | "bothTeamsAboveLeagueAverage"
  | "neitherTeamLowScoring";

export type StrategyDetails = {
  id: StrategyId;
  title: string;
  description: string;
};

export const strategyDetails: StrategyDetails[] = [
  {
    id: "bothTeamsAboveLeagueAverage",
    title: "Over 2.5 goals · both teams above league average",
    description:
      "Both teams’ season Over 2.5 rate must be higher than their league’s current season rate.",
  },
  {
    id: "neitherTeamLowScoring",
    title: "Over 2.5 goals · neither team low scoring",
    description:
      "Home team must average at least 1.5 goals scored at home, and away team at least 1.5 goals scored away, using pre-match stats.",
  },
];

export type TeamFilterVariation = {
  id: string;
  title: string;
  description: string;
  scoringThreshold?: number;
  defensiveThreshold?: number;
  exclusionMode: "eitherTeam" | "bothTeams";
};

function modeLabel(mode: TeamFilterVariation["exclusionMode"]) {
  return mode === "eitherTeam" ? "Both teams" : "At least one team";
}

function createVariation(
  scoringThreshold: number | undefined,
  defensiveThreshold: number | undefined,
  exclusionMode: TeamFilterVariation["exclusionMode"],
): TeamFilterVariation {
  const filterId = [
    scoringThreshold === undefined ? null : `score${scoringThreshold}`,
    defensiveThreshold === undefined ? null : `defend${defensiveThreshold}`,
  ].filter(Boolean).join("-");
  const requirements = [
    scoringThreshold === undefined ? null : `${modeLabel(exclusionMode)}: score >= ${scoringThreshold}`,
    defensiveThreshold === undefined ? null : `${modeLabel(exclusionMode)}: concede >= ${defensiveThreshold}`,
  ].filter((filter): filter is string => filter !== null);

  return {
    id: `${filterId}-${exclusionMode}`,
    title: requirements.join(" · "),
    description: `Relevant venue averages must meet: ${requirements.join("; ")}.`,
    scoringThreshold,
    defensiveThreshold,
    exclusionMode,
  };
}

const thresholds = [1.3, 1.5, 1.7] as const;

export const teamFilterVariations: TeamFilterVariation[] = [
  {
    id: "noTeamFilters",
    title: "Base · no team filters",
    description: "Every fixture with a stored pre-match Over 2.5 price above the odds floor.",
    exclusionMode: "eitherTeam",
  },
  ...thresholds.flatMap((threshold) =>
    (["eitherTeam", "bothTeams"] as const).map((mode) =>
      createVariation(threshold, undefined, mode),
    ),
  ),
  ...thresholds.flatMap((threshold) =>
    (["eitherTeam", "bothTeams"] as const).map((mode) =>
      createVariation(undefined, threshold, mode),
    ),
  ),
  ...thresholds.flatMap((scoring) =>
    thresholds.flatMap((defensive) =>
      (["eitherTeam", "bothTeams"] as const).map((mode) =>
        createVariation(scoring, defensive, mode),
      ),
    ),
  ),
];
