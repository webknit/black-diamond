import type { BotdEvidenceScope, BotdMarket } from "@black-diamond/core/strategies";

export type BotdCandidate = {
  fixtureId: number;
  leagueId?: number;
  strategyId: string;
  market: BotdMarket;
  marketLabel: string;
  strategyTitle: string;
  referenceOdd: number | null;
  evidenceScope: BotdEvidenceScope;
  tier: "lowConfidence" | "eligible" | "strong" | "highConfidence";
  leaguePerformance: { bets: number; wins: number; losses: number; profit: number };
};

const tierScore = { lowConfidence: 1, eligible: 2, strong: 3, highConfidence: 4 } as const;
const scopeScore = { leagueOnly: 1, leagueAndTeam: 2, teamFiltered: 3 } as const;

export function getTierScore(tier: BotdCandidate["tier"]) {
  return tierScore[tier];
}

function compareCandidates(left: BotdCandidate, right: BotdCandidate) {
  return (
    scopeScore[right.evidenceScope] - scopeScore[left.evidenceScope] ||
    tierScore[right.tier] - tierScore[left.tier] ||
    right.leaguePerformance.profit / (right.leaguePerformance.bets + 30) -
      left.leaguePerformance.profit / (left.leaguePerformance.bets + 30) ||
    left.strategyId.localeCompare(right.strategyId) ||
    left.fixtureId - right.fixtureId
  );
}

/** Select one non-correlated candidate per fixture before ranking the day. */
export function chooseFixtureCandidates(candidates: readonly BotdCandidate[]) {
  const candidatesByFixtureId = new Map<number, BotdCandidate[]>();
  for (const candidate of candidates) {
    const fixtureCandidates = candidatesByFixtureId.get(candidate.fixtureId) ?? [];
    fixtureCandidates.push(candidate);
    candidatesByFixtureId.set(candidate.fixtureId, fixtureCandidates);
  }
  return [...candidatesByFixtureId.values()]
    .map((fixtureCandidates) => fixtureCandidates.sort(compareCandidates)[0]!)
    .sort(compareCandidates);
}

/**
 * League-only strategies are shared trends, rather than independent evidence
 * for every fixture in a league. Keep them visible outside Top picks, while
 * preventing them from filling the curated list.
 */
export function diversifyTopCandidates(candidates: readonly BotdCandidate[]) {
  const pickedPerLeague = new Map<number, number>();
  const pickedLeagueOnlyPerMarket = new Set<string>();

  return candidates.filter((candidate) => {
    // Days written before leagueId was persisted remain readable until refresh.
    if (candidate.leagueId === undefined) return true;
    if ((pickedPerLeague.get(candidate.leagueId) ?? 0) >= 2) return false;

    const leagueMarket = `${candidate.leagueId}:${candidate.market}`;
    if (
      candidate.evidenceScope === "leagueOnly" &&
      pickedLeagueOnlyPerMarket.has(leagueMarket)
    ) {
      return false;
    }

    pickedPerLeague.set(candidate.leagueId, (pickedPerLeague.get(candidate.leagueId) ?? 0) + 1);
    if (candidate.evidenceScope === "leagueOnly") pickedLeagueOnlyPerMarket.add(leagueMarket);
    return true;
  });
}
