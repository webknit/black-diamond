export type Fixture = {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
      extra: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    season: number;
    round: string | null;
  };
  teams: {
    home: FixtureTeam;
    away: FixtureTeam;
  };
  goals: FixtureScore;
  score: {
    halftime: FixtureScore;
    fulltime: FixtureScore;
    extratime: FixtureScore;
    penalty: FixtureScore;
  };
};

type FixtureTeam = {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
};

type FixtureScore = {
  home: number | null;
  away: number | null;
};
