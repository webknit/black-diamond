export type BetMarketType = "matchWinner" | "doubleChance" | "goalsOverUnder" | "btts";

export type BetOutcome =
  | "home"
  | "draw"
  | "away"
  | "homeDraw"
  | "homeAway"
  | "drawAway"
  | "over"
  | "under"
  | "yes"
  | "no";

export type Bet = {
  id: string;
  accountId: string;
  selections: BetSelection[];
  placedOdds: number;
  stake: number;
  matchStatus: "matched" | "unmatched";
  status: "pending" | "won" | "lost" | "void";
  returnAmount: number | null;
  profit: number | null;
  placedAt: string;
  settledAt: string | null;
};

export type BetSelection = {
  fixture: {
    id: number;
    date: string;
    homeTeamName: string;
    awayTeamName: string;
  };
  market: {
    type: BetMarketType;
    name: string;
    outcome: BetOutcome;
    selection: string;
    line: number | null;
  };
  referenceOdds: number | null;
  referenceOddsSource: "Bet365" | "Betfair" | null;
};
