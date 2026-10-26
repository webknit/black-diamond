export type FixtureLineupPlayer = {
  id: number;
  name: string;
  number: number | null;
  position: string | null;
};

export type FixtureTeamLineup = {
  teamId: number;
  formation: string | null;
  coach: {
    name: string;
  } | null;
  startXI: FixtureLineupPlayer[];
};

export type FixtureLineups = {
  fixtureId: number;
  lineups: FixtureTeamLineup[];
  syncedAt: string;
};
