type Options = {
  homeGoalsFor?: number;
  awayGoalsFor?: number;
  homeGoalsAgainst?: number;
  awayGoalsAgainst?: number;
  homePlayed?: number;
  awayPlayed?: number;
  rates?: Partial<Record<"over0_5" | "over1_5" | "over2_5" | "over3_5" | "under1_5" | "under2_5" | "under3_5" | "btts", number>>;
};

export function strategySnapshot({
  homeGoalsFor = 3,
  awayGoalsFor = 3,
  homeGoalsAgainst = 3,
  awayGoalsAgainst = 3,
  homePlayed = 5,
  awayPlayed = 5,
  rates = {},
}: Options = {}) {
  const record = (goalsFor: number, goalsAgainst: number, played: number) => ({
    played,
    goalsFor: goalsFor * played,
    goalsAgainst: goalsAgainst * played,
    summary: Object.fromEntries(
      Object.entries({ over0_5: 100, over1_5: 100, over2_5: 100, over3_5: 100, under1_5: 100, under2_5: 100, under3_5: 100, btts: 100, ...rates })
        .map(([market, percentage]) => [market, { percentage, count: (percentage / 100) * played }]),
    ),
  });
  const home = record(homeGoalsFor, homeGoalsAgainst, homePlayed);
  const away = record(awayGoalsFor, awayGoalsAgainst, awayPlayed);
  return {
    home: { last5: home.summary, last5Venue: home, last3Venue: record(homeGoalsFor, homeGoalsAgainst, 3), fixtures: { home } },
    away: { last5: away.summary, last5Venue: away, last3Venue: record(awayGoalsFor, awayGoalsAgainst, 3), fixtures: { away } },
  } as never;
}
