import type { Fixture } from "@black-diamond/core/fixture";

export type ApiFootballFixturesResponse = {
  get: "fixtures";
  parameters: Record<string, string>;
  errors: Record<string, unknown>[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: Fixture[];
};
