import { getFixturesBefore } from "@black-diamond/database/fixtures";
import { upsertFixtureStatsSnapshot } from "@black-diamond/database/fixtureStatsSnapshots";
import type { Fixture } from "@black-diamond/core/fixture";

export async function syncFixtureStatsSnapshot(fixture: Fixture) {
  const prior = await getFixturesBefore(
    fixture.league.id,
    fixture.league.season,
    fixture.fixture.timestamp,
  );
  const leagueTable = new Map<
    number,
    { points: number; goalsFor: number; goalsAgainst: number }
  >();
  const teamIds = new Set<number>();
  for (const item of prior) {
    const homeId = item.teams.home.id;
    const awayId = item.teams.away.id;
    const homeGoals = item.goals.home!;
    const awayGoals = item.goals.away!;
    teamIds.add(homeId);
    teamIds.add(awayId);
    const home = leagueTable.get(homeId) ?? {
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };
    const away = leagueTable.get(awayId) ?? {
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;
    if (homeGoals > awayGoals) home.points += 3;
    else if (awayGoals > homeGoals) away.points += 3;
    else {
      home.points += 1;
      away.points += 1;
    }
    leagueTable.set(homeId, home);
    leagueTable.set(awayId, away);
  }
  const leaguePositions = new Map(
    [...leagueTable.entries()]
      .sort(
        ([, a], [, b]) =>
          b.points - a.points ||
          b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
          b.goalsFor - a.goalsFor,
      )
      .map(([teamId], index) => [teamId, index + 1]),
  );
  const build = (team: typeof fixture.teams.home) => {
    const all = prior.filter(
      (item) =>
        item.teams.home.id === team.id || item.teams.away.id === team.id,
    );
    const home = all.filter((item) => item.teams.home.id === team.id);
    const away = all.filter((item) => item.teams.away.id === team.id);
    const form = (items: Fixture[]) =>
      items
        .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
        .slice(-5)
        .map((item) => {
          const isHome = item.teams.home.id === team.id;
          const goalsFor = isHome ? item.goals.home! : item.goals.away!;
          const goalsAgainst = isHome ? item.goals.away! : item.goals.home!;
          return goalsFor > goalsAgainst
            ? "W"
            : goalsFor === goalsAgainst
              ? "D"
              : "L";
        })
        .join("");
    const record = (items: Fixture[]) => {
      let wins = 0,
        draws = 0,
        gf = 0,
        ga = 0,
        cs = 0,
        fts = 0,
        btts = 0,
        o05 = 0,
        o15 = 0,
        o25 = 0;
      for (const item of items) {
        const isHome = item.teams.home.id === team.id;
        const f = isHome ? item.goals.home! : item.goals.away!;
        const a = isHome ? item.goals.away! : item.goals.home!;
        gf += f;
        ga += a;
        if (f > a) wins++;
        if (f === a) draws++;
        if (a === 0) cs++;
        if (f === 0) fts++;
        const t = f + a;
        if (f > 0 && a > 0) btts++;
        if (t > 0) o05++;
        if (t > 1) o15++;
        if (t > 2) o25++;
      }
      const p = (n: number) => (items.length ? (n / items.length) * 100 : 0);
      return {
        played: items.length,
        wins,
        draws,
        loses: items.length - wins - draws,
        goalsFor: gf,
        goalsAgainst: ga,
        cs,
        fts,
        summary: {
          wins: { count: wins, percentage: p(wins) },
          draws: { count: draws, percentage: p(draws) },
          btts: { count: btts, percentage: p(btts) },
          over0_5: { count: o05, percentage: p(o05) },
          over1_5: { count: o15, percentage: p(o15) },
          over2_5: { count: o25, percentage: p(o25) },
          under0_5: {
            count: items.length - o05,
            percentage: p(items.length - o05),
          },
          under1_5: {
            count: items.length - o15,
            percentage: p(items.length - o15),
          },
          under2_5: {
            count: items.length - o25,
            percentage: p(items.length - o25),
          },
        },
      };
    };
    const total = record(all),
      h = record(home),
      a = record(away);
    return {
      team: { id: team.id, name: team.name, logo: team.logo },
      leaguePosition: leaguePositions.get(team.id) ?? null,
      leaguePoints: total.wins * 3 + total.draws,
      leagueTeams: teamIds.size,
      form: form(all),
      formHome: form(home),
      formAway: form(away),
      fixtures: { home: h, away: a, total },
      cleanSheets: { home: h.cs, away: a.cs, total: total.cs },
      failedToScore: { home: h.fts, away: a.fts, total: total.fts },
      summary: total.summary,
    };
  };
  await upsertFixtureStatsSnapshot({
    fixtureId: fixture.fixture.id,
    fixtureDateAtSnapshot: fixture.fixture.date,
    snapshotCapturedAt: new Date().toISOString(),
    home: build(fixture.teams.home),
    away: build(fixture.teams.away),
  });
}
