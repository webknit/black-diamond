import type { League } from "@black-diamond/core/league";

export type ApiFootballLeaguesResponse = {
  get: "leagues";
  parameters: Record<string, string>;
  errors: Record<string, unknown>[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: League[];
};
