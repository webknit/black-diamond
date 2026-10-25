import type { FixtureEvent } from "@black-diamond/core/fixtureEvents";

export type ApiFootballFixtureEventsResponse = {
  get: "fixtures/events";
  parameters: { fixture: string };
  errors: Record<string, unknown>;
  results: number;
  paging: { current: number; total: number };
  response: FixtureEvent[];
};
