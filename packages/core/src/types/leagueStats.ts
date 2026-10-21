export type CountAndPercentage = {
  count: number;
  percentage: number;
};

export type LeagueStats = {
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
  };
  fixturesPlayed: number;
  results: {
    homeWins: CountAndPercentage;
    awayWins: CountAndPercentage;
    draws: CountAndPercentage;
  };
  goals: {
    total: number;
    averagePerFixture: number;
    homeAveragePerFixture: number;
    awayAveragePerFixture: number;
  };
  btts: CountAndPercentage;
  over0_5: CountAndPercentage;
  over1_5: CountAndPercentage;
  over2_5: CountAndPercentage;
  under0_5: CountAndPercentage;
  under1_5: CountAndPercentage;
  under2_5: CountAndPercentage;
};
