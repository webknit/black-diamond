import type { FixtureStatsSnapshot } from "../types/fixtureStatsSnapshot.js";

type ScoringMode = "bothTeams" | "atLeastOneTeam";

export type Over3_5StrategyVariation = {
  id: string;
  title: string;
  description: string;
  scoringThreshold?: number;
  defensiveThreshold?: number;
  totalGoalsThreshold?: number;
  scoringMode?: ScoringMode;
  over3_5RateThreshold?: number;
};

const scoringThresholds = [1.5, 1.7, 2] as const;
const dominantScoringThresholds = [2, 2.25, 2.5] as const;
const defensiveThresholds = [1.25, 1.5, 1.75] as const;
const totalGoalsThresholds = [2.5, 2.75, 3] as const;

const label = (mode: ScoringMode) =>
  mode === "bothTeams" ? "Both teams" : "At least one team";

function createFormVariation(
  score: number,
  concede: number,
  total: number,
  scoringMode: ScoringMode,
): Over3_5StrategyVariation {
  const requirements = [
    `${label(scoringMode)}: score >= ${score}`,
    `Both teams: concede >= ${concede}`,
    `Both teams: total goals >= ${total}`,
  ];
  const routeLabel =
    scoringMode === "bothTeams"
      ? "Both teams high-scoring and defensively open"
      : "Dominant attack vs defensively open opponent";
  return {
    id: `over3_5-score${score}-${scoringMode}-concede${concede}-total${total}`,
    title: `${routeLabel} · ${requirements.join(" · ")}`,
    description: `Last 5 relevant-venue matches must meet: ${requirements.join("; ")}.`,
    scoringThreshold: score,
    defensiveThreshold: concede,
    totalGoalsThreshold: total,
    scoringMode,
  };
}
export const over3_5StrategyVariations: Over3_5StrategyVariation[] = [
  {
    id: "over3_5-base",
    title: "Base · no team filters",
    description:
      "Every fixture with a stored pre-match Over 3.5 price above the odds floor.",
  },
  ...[40, 60, 80].map((rate) => ({
    id: `over3_5-rate${rate}-last5`,
    title: `Both teams: last 5 Over 3.5 >= ${rate}%`,
    description: `Each team had Over 3.5 goals in at least ${rate}% of its previous 5 matches.`,
    over3_5RateThreshold: rate,
  })),
  ...scoringThresholds.flatMap((score) =>
    defensiveThresholds.flatMap((concede) =>
      totalGoalsThresholds.map((total) =>
        createFormVariation(score, concede, total, "bothTeams"),
      ),
    ),
  ),
  ...dominantScoringThresholds.flatMap((score) =>
    defensiveThresholds.flatMap((concede) =>
      totalGoalsThresholds.map((total) =>
        createFormVariation(score, concede, total, "atLeastOneTeam"),
      ),
    ),
  ),
];

const average = (goals: number, played: number) =>
  played === 0 ? null : goals / played;
const meets = (
  values: Array<number | null>,
  threshold: number,
  mode: ScoringMode,
) =>
  !values.some((value) => value === null) &&
  (mode === "bothTeams"
    ? values.every((value) => value! >= threshold)
    : values.some((value) => value! >= threshold));

export function matchesOver3_5StrategyVariation(
  snapshot: FixtureStatsSnapshot,
  strategy: Over3_5StrategyVariation,
) {
  if (
    strategy.over3_5RateThreshold === undefined &&
    strategy.scoringThreshold === undefined
  )
    return true;
  const home = snapshot.home.last5Venue,
    away = snapshot.away.last5Venue;
  if (home.played !== 5 || away.played !== 5) return false;
  if (
    strategy.over3_5RateThreshold !== undefined &&
    (home.summary.over3_5.percentage < strategy.over3_5RateThreshold ||
      away.summary.over3_5.percentage < strategy.over3_5RateThreshold)
  )
    return false;
  if (strategy.scoringThreshold === undefined) return true;
  const scoring = [
    average(home.goalsFor, home.played),
    average(away.goalsFor, away.played),
  ];
  const conceding = [
    average(home.goalsAgainst, home.played),
    average(away.goalsAgainst, away.played),
  ];
  const totalGoals = [
    average(home.goalsFor + home.goalsAgainst, home.played),
    average(away.goalsFor + away.goalsAgainst, away.played),
  ];
  return (
    meets(scoring, strategy.scoringThreshold, strategy.scoringMode!) &&
    meets(conceding, strategy.defensiveThreshold!, "bothTeams") &&
    meets(totalGoals, strategy.totalGoalsThreshold!, "bothTeams")
  );
}
