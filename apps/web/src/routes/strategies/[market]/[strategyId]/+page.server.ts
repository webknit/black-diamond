import { error } from '@sveltejs/kit';
import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { botdStrategies, getBettableMinimumOdds, getBotdMarketLabel, getBotdReferenceOdd, matchesBotdStrategy } from '@black-diamond/core/strategies';
import { getFixtureOddsForFixtures } from '@black-diamond/database/fixtureOdds';
import { getFinishedFixturesWithStatsSnapshotsForLeagues } from '@black-diamond/database/fixtureStatsSnapshots';

const batchSize = 2_000;
type LeagueRate = { fixturesPlayed: number; over1_5Percentage: number; over2_5Percentage: number; bttsPercentage: number };
type StrategyBet = { fixtureId: number; date: string; league: string; homeTeam: string; awayTeam: string; homeGoals: number | null; awayGoals: number | null; referenceOdd: number; won: boolean; profit: number };

async function oddsInBatches(ids: number[]) {
	const result = [];
	for (let index = 0; index < ids.length; index += batchSize) result.push(...await getFixtureOddsForFixtures(ids.slice(index, index + batchSize)));
	return result;
}
function rate(totals: { played: number; over15: number; over25: number; btts: number }): LeagueRate {
	const percentage = (value: number) => totals.played ? value / totals.played * 100 : 0;
	return { fixturesPlayed: totals.played, over1_5Percentage: percentage(totals.over15), over2_5Percentage: percentage(totals.over25), bttsPercentage: percentage(totals.btts) };
}
function add(totals: { played: number; over15: number; over25: number; btts: number }, fixture: { goals: { home: number | null; away: number | null } }) {
	if (fixture.goals.home === null || fixture.goals.away === null) return;
	const goals = fixture.goals.home + fixture.goals.away; totals.played++;
	if (goals > 1) totals.over15++; if (goals > 2) totals.over25++; if (fixture.goals.home > 0 && fixture.goals.away > 0) totals.btts++;
}

export async function load({ params }: { params: { market: string; strategyId: string } }) {
	const strategy = botdStrategies.find((item) => item.id === params.strategyId && item.market.replaceAll('_', '-') === params.market);
	if (!strategy) throw error(404, 'Strategy not found');
	const minimumOdds = getBettableMinimumOdds(strategy.market);
	const fixtures = await getFinishedFixturesWithStatsSnapshotsForLeagues(selectedLeagues.map((league) => league.id));
	const odds = await oddsInBatches(fixtures.map((fixture) => fixture.fixture.id));
	const oddsById = new Map(odds.map((item) => [item.fixtureId, item]));
	const bets: StrategyBet[] = [];
	const totalsByLeagueSeason = new Map<string, { played: number; over15: number; over25: number; btts: number }>();
	const chronological = [...fixtures].sort((left, right) => left.fixture.timestamp - right.fixture.timestamp);
	for (let start = 0; start < chronological.length;) {
		const timestamp = chronological[start].fixture.timestamp; let end = start;
		while (end < chronological.length && chronological[end].fixture.timestamp === timestamp) end++;
		for (const fixture of chronological.slice(start, end)) {
			const snapshot = fixture.fixtureStatsSnapshot; const key = `${fixture.league.id}:${fixture.league.season}`;
			const league = rate(totalsByLeagueSeason.get(key) ?? { played: 0, over15: 0, over25: 0, btts: 0 });
			const odd = getBotdReferenceOdd(oddsById.get(fixture.fixture.id)?.odds ?? [], strategy.market);
			if (!snapshot || odd === null || odd < minimumOdds || !matchesBotdStrategy(snapshot, league, strategy)) continue;
			const goals = (fixture.goals.home ?? 0) + (fixture.goals.away ?? 0);
			const won = strategy.market === 'over2_5' ? goals > 2 : strategy.market === 'over3_5' ? goals > 3 : strategy.market === 'over1_5' ? goals > 1 : strategy.market === 'over0_5' ? goals > 0 : strategy.market === 'under3_5' ? goals < 4 : strategy.market === 'under2_5' ? goals < 3 : strategy.market === 'under1_5' ? goals < 2 : strategy.market === 'btts' ? fixture.goals.home! > 0 && fixture.goals.away! > 0 : fixture.goals.home === 0 || fixture.goals.away === 0;
			bets.push({ fixtureId: fixture.fixture.id, date: new Date(timestamp * 1000).toISOString(), league: fixture.league.name, homeTeam: fixture.teams.home.name, awayTeam: fixture.teams.away.name, homeGoals: fixture.goals.home, awayGoals: fixture.goals.away, referenceOdd: odd, won, profit: won ? odd - 1 : -1 });
		}
		for (const fixture of chronological.slice(start, end)) { const key = `${fixture.league.id}:${fixture.league.season}`; const totals = totalsByLeagueSeason.get(key) ?? { played: 0, over15: 0, over25: 0, btts: 0 }; add(totals, fixture); totalsByLeagueSeason.set(key, totals); }
		start = end;
	}
	return { strategy, marketLabel: getBotdMarketLabel(strategy.market), minimumOdds, bets: bets.reverse().slice(0, 10) };
}
