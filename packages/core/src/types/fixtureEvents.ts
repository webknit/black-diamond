export type FixtureEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string; logo: string | null };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
};

export type FixtureEvents = {
  fixtureId: number;
  events: FixtureEvent[];
  syncedAt: string;
};
