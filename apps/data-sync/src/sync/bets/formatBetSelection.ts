import type { BetSelection } from "@black-diamond/core/bet";

/** Turns API-facing selection values into the labels used in the app. */
export function formatBetSelection(market: BetSelection["market"]): string {
  if (market.type === "btts") {
    return market.outcome === "yes" ? "BTTS" : "BTNTS";
  }

  return market.selection;
}
