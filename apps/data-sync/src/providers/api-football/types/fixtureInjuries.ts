export type ApiFootballFixtureInjuriesResponse = {
  response: Array<{
    player: {
      id: number;
      name: string;
      photo: string | null;
      type: "Missing Fixture" | "Questionable" | string;
      reason: string | null;
    };
    team: {
      id: number;
      name: string;
      logo: string | null;
    };
    fixture: {
      id: number;
    };
  }>;
};
