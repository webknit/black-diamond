import type { Fixture } from "@black-diamond/core/fixture";
import type { LeagueStats } from "@black-diamond/core/leagueStats";

import { getDatabase } from "../../mongodb.js";

type LeagueStatsInput = LeagueStats["league"];

type Totals = {
  fixturesPlayed: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalGoals: number;
  homeGoals: number;
  awayGoals: number;
  btts: number;
  over0_5: number;
  over1_5: number;
  over2_5: number;
  under0_5: number;
  under1_5: number;
  under2_5: number;
};

type RoundDetails = {
  phase: string | null;
  number: number | null;
  totalInPhase: number | null;
};

const completedFixtureStatuses = new Set(["FT", "AET", "PEN"]);

function emptyTotals(): Totals {
  return {
    fixturesPlayed: 0,
    homeWins: 0,
    awayWins: 0,
    draws: 0,
    totalGoals: 0,
    homeGoals: 0,
    awayGoals: 0,
    btts: 0,
    over0_5: 0,
    over1_5: 0,
    over2_5: 0,
    under0_5: 0,
    under1_5: 0,
    under2_5: 0,
  };
}

function isCompletedFixture(fixture: Fixture): boolean {
  return completedFixtureStatuses.has(fixture.fixture.status.short)
    && fixture.goals.home !== null
    && fixture.goals.away !== null;
}

function addFixture(totals: Totals, fixture: Fixture): void {
  const homeGoals = fixture.goals.home;
  const awayGoals = fixture.goals.away;

  if (homeGoals === null || awayGoals === null) return;

  const totalGoals = homeGoals + awayGoals;

  totals.fixturesPlayed += 1;
  totals.totalGoals += totalGoals;
  totals.homeGoals += homeGoals;
  totals.awayGoals += awayGoals;
  if (homeGoals > awayGoals) totals.homeWins += 1;
  if (awayGoals > homeGoals) totals.awayWins += 1;
  if (homeGoals === awayGoals) totals.draws += 1;
  if (homeGoals > 0 && awayGoals > 0) totals.btts += 1;
  if (totalGoals > 0) totals.over0_5 += 1;
  if (totalGoals > 1) totals.over1_5 += 1;
  if (totalGoals > 2) totals.over2_5 += 1;
  if (totalGoals < 1) totals.under0_5 += 1;
  if (totalGoals < 2) totals.under1_5 += 1;
  if (totalGoals < 3) totals.under2_5 += 1;
}

function countAndPercentage(count: number, fixturesPlayed: number) {
  return {
    count,
    percentage: fixturesPlayed === 0 ? 0 : (count / fixturesPlayed) * 100,
  };
}

function parseRound(round: string): { phase: string; number: number } | null {
  const match = /^(.*) - (\d+)$/.exec(round);

  if (!match) return null;

  return { phase: match[1], number: Number(match[2]) };
}

function getRoundDetails(rounds: Iterable<string>): Map<string, RoundDetails> {
  const parsedRounds = [...rounds].map((round) => ({ round, parsed: parseRound(round) }));
  const totalsByPhase = new Map<string, number>();

  for (const { parsed } of parsedRounds) {
    if (!parsed) continue;

    totalsByPhase.set(
      parsed.phase,
      Math.max(totalsByPhase.get(parsed.phase) ?? 0, parsed.number),
    );
  }

  return new Map(parsedRounds.map(({ round, parsed }) => [
    round,
    parsed
      ? {
          phase: parsed.phase,
          number: parsed.number,
          totalInPhase: totalsByPhase.get(parsed.phase) ?? null,
        }
      : { phase: null, number: null, totalInPhase: null },
  ]));
}

function buildSnapshot(
  league: LeagueStatsInput,
  round: string,
  roundDetails: RoundDetails,
  roundLastFixtureTimestamp: number,
  totals: Totals,
): LeagueStats {
  const average = (value: number) =>
    totals.fixturesPlayed === 0 ? 0 : value / totals.fixturesPlayed;

  return {
    league,
    round,
    roundPhase: roundDetails.phase,
    roundNumber: roundDetails.number,
    totalRoundsInPhase: roundDetails.totalInPhase,
    roundLastFixtureTimestamp,
    calculatedAt: new Date(),
    fixturesPlayed: totals.fixturesPlayed,
    results: {
      homeWins: countAndPercentage(totals.homeWins, totals.fixturesPlayed),
      awayWins: countAndPercentage(totals.awayWins, totals.fixturesPlayed),
      draws: countAndPercentage(totals.draws, totals.fixturesPlayed),
    },
    goals: {
      total: totals.totalGoals,
      averagePerFixture: average(totals.totalGoals),
      homeAveragePerFixture: average(totals.homeGoals),
      awayAveragePerFixture: average(totals.awayGoals),
    },
    btts: countAndPercentage(totals.btts, totals.fixturesPlayed),
    over0_5: countAndPercentage(totals.over0_5, totals.fixturesPlayed),
    over1_5: countAndPercentage(totals.over1_5, totals.fixturesPlayed),
    over2_5: countAndPercentage(totals.over2_5, totals.fixturesPlayed),
    under0_5: countAndPercentage(totals.under0_5, totals.fixturesPlayed),
    under1_5: countAndPercentage(totals.under1_5, totals.fixturesPlayed),
    under2_5: countAndPercentage(totals.under2_5, totals.fixturesPlayed),
  };
}

export async function calculateLeagueStatsSnapshots(
  league: LeagueStatsInput,
): Promise<LeagueStats[]> {
  const database = await getDatabase();
  const fixtures = await database
    .collection<Fixture>("fixtures")
    .find({ "league.id": league.id, "league.season": league.season })
    .sort({ "fixture.timestamp": 1 })
    .toArray();

  const rounds = new Map<string, { roundLastFixtureTimestamp: number; hasCompletedFixture: boolean }>();

  for (const fixture of fixtures) {
    if (!fixture.league.round) continue;

    const existing = rounds.get(fixture.league.round);
    rounds.set(fixture.league.round, {
      roundLastFixtureTimestamp: Math.max(
        existing?.roundLastFixtureTimestamp ?? 0,
        fixture.fixture.timestamp,
      ),
      hasCompletedFixture: Boolean(existing?.hasCompletedFixture) || isCompletedFixture(fixture),
    });
  }

  const completedFixtures = fixtures.filter(isCompletedFixture);
  const roundDetails = getRoundDetails(rounds.keys());
  const totals = emptyTotals();
  let completedFixtureIndex = 0;

  return [...rounds.entries()]
    .filter(([, round]) => round.hasCompletedFixture)
    .sort(([, left], [, right]) =>
      left.roundLastFixtureTimestamp - right.roundLastFixtureTimestamp,
    )
    .map(([round, { roundLastFixtureTimestamp }]) => {
      while (
        completedFixtureIndex < completedFixtures.length
        && completedFixtures[completedFixtureIndex].fixture.timestamp <= roundLastFixtureTimestamp
      ) {
        addFixture(totals, completedFixtures[completedFixtureIndex]);
        completedFixtureIndex += 1;
      }

      return buildSnapshot(
        league,
        round,
        roundDetails.get(round) ?? { phase: null, number: null, totalInPhase: null },
        roundLastFixtureTimestamp,
        totals,
      );
    });
}
