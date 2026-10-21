import type { LeagueStandings } from "@black-diamond/core/leagueStandings";

export type ApiFootballStandingsResponse = {
  get: "standings";
  parameters: Record<string, string>;
  errors: Record<string, unknown>[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: LeagueStandings[];
};
