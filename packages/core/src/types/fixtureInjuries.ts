export type FixtureInjury = {
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
};

export type FixtureInjuries = {
  fixtureId: number;
  injuries: FixtureInjury[];
  syncedAt: string;
};
