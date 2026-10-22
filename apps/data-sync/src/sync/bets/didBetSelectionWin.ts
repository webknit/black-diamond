import type { BetSelection } from "@black-diamond/core/bet";
import type { Fixture } from "@black-diamond/core/fixture";
export function didBetSelectionWin(selection: BetSelection, fixture: Fixture): boolean | null {
  const { home, away } = fixture.score.fulltime; if (home === null || away === null) return null;
  const { type, outcome, line } = selection.market;
  if (type === "matchWinner") return outcome === "home" ? home > away : outcome === "away" ? away > home : home === away;
  if (type === "doubleChance") return outcome === "homeDraw" ? home >= away : outcome === "drawAway" ? away >= home : home !== away;
  if (type === "goalsOverUnder") return outcome === "over" ? home + away > line! : home + away < line!;
  return outcome === "yes" ? home > 0 && away > 0 : home === 0 || away === 0;
}
