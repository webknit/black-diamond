export type ApiFootballFixtureLineupsResponse = {
  response: Array<{
    team: { id: number };
    formation: string | null;
    coach: { name: string } | null;
    startXI: Array<{
      player: {
        id: number;
        name: string;
        number: number | null;
        pos: string | null;
      };
    }>;
  }>;
};
