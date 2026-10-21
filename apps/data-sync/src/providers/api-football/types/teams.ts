import type { Team } from "@black-diamond/core/team";
import type { TeamStats } from "@black-diamond/core/teamStats";

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

export type ApiFootballTeamStatisticsResponse = {
  get: "teams/statistics";
  parameters: Record<string, string>;
  errors: Record<string, unknown>;
  results: number;
  response: TeamStats;
};
