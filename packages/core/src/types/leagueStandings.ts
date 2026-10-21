export type StandingRecord = {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
};

export type Standing = {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  points: number;
  goalsDiff: number | null;
  group: string;
  form: string | null;
  status: string;
  description: string | null;
  all: StandingRecord;
  home: StandingRecord;
  away: StandingRecord;
  update: string;
};

export type LeagueStandings = {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    season: number;
    standings: Standing[][];
  };
};
