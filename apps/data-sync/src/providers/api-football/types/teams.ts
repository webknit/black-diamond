import type { Team } from "@black-diamond/core/team";

export type ApiFootballTeamsResponse = {
  get: "teams";
  parameters: Record<string, string>;
  errors: Record<string, unknown>[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: Team[];
};
