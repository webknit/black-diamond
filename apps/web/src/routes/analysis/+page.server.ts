import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getFinishedFixturesForAnalysis } from '@black-diamond/database/fixtureStatsSnapshots';
import { matchesOver25Strategy } from '#lib/server/strategies/matchesOver25Strategy.js';

type LeagueTotals = { fixtures: number; over2_5: number };
type TeamHistory = boolean[];

function isOver2_5(homeGoals: number | null, awayGoals: number | null) {
	return homeGoals !== null && awayGoals !== null && homeGoals + awayGoals > 2;
}

function getOver2_5Percentage(matches: TeamHistory, limit?: number) {
	const relevantMatches = limit ? matches.slice(-limit) : matches;
	if (relevantMatches.length === 0) return null;

	return (relevantMatches.filter(Boolean).length / relevantMatches.length) * 100;
}

function getTeamHistoryKey(leagueId: number, season: number, teamId: number) {
	return `${leagueId}:${season}:${teamId}`;
}

export async function load({ url }: { url: URL }) {
	const requestedLeagueId = Number(url.searchParams.get('league'));
	const selectedLeagueIds = selectedLeagues.map((league) => league.id);
	const finishedFixtures = await getFinishedFixturesForAnalysis(selectedLeagueIds);
	const leagueTotals = new Map<number, LeagueTotals>();
	const teamHistories = new Map<string, TeamHistory>();

	const analyses = finishedFixtures.flatMap((fixture) => {
		const homeHistoryKey = getTeamHistoryKey(
			fixture.league.id,
			fixture.league.season,
			fixture.teams.home.id
		);
		const awayHistoryKey = getTeamHistoryKey(
			fixture.league.id,
			fixture.league.season,
			fixture.teams.away.id
		);
		const homeHistory = teamHistories.get(homeHistoryKey) ?? [];
		const awayHistory = teamHistories.get(awayHistoryKey) ?? [];
		const previousLeagueTotals = leagueTotals.get(fixture.league.id) ?? { fixtures: 0, over2_5: 0 };
		const over2_5 = isOver2_5(fixture.goals.home, fixture.goals.away);
		const leagueOver2_5Percentage =
			previousLeagueTotals.fixtures === 0
				? null
				: (previousLeagueTotals.over2_5 / previousLeagueTotals.fixtures) * 100;

		leagueTotals.set(fixture.league.id, {
			fixtures: previousLeagueTotals.fixtures + 1,
			over2_5: previousLeagueTotals.over2_5 + Number(over2_5)
		});
		teamHistories.set(homeHistoryKey, [...homeHistory, over2_5]);
		teamHistories.set(awayHistoryKey, [...awayHistory, over2_5]);

		if (!fixture.fixtureStatsSnapshot) return [];

		const homeOver2_5Percentage = fixture.fixtureStatsSnapshot.home.summary.over2_5.percentage;
		const awayOver2_5Percentage = fixture.fixtureStatsSnapshot.away.summary.over2_5.percentage;
		const bothTeamsAboveLeagueAverage = matchesOver25Strategy(
			homeOver2_5Percentage,
			awayOver2_5Percentage,
			leagueOver2_5Percentage
		);

		return [{
			fixtureId: fixture.fixture.id,
			date: fixture.fixture.date,
			league: fixture.league,
			homeTeam: fixture.teams.home.name,
			awayTeam: fixture.teams.away.name,
			homeGoals: fixture.goals.home,
			awayGoals: fixture.goals.away,
			over2_5,
			leagueOver2_5Percentage,
			homeOver2_5Percentage,
			homeLast5Over2_5Percentage: getOver2_5Percentage(homeHistory, 5),
			awayOver2_5Percentage,
			awayLast5Over2_5Percentage: getOver2_5Percentage(awayHistory, 5),
			bothTeamsAboveLeagueAverage
		}];
	});

	const availableLeagues = selectedLeagues.filter((league) =>
		analyses.some((analysis) => analysis.league.id === league.id)
	);
	const filteredAnalyses = analyses.filter(
		(analysis) => !requestedLeagueId || analysis.league.id === requestedLeagueId
	);
	const over2_5Wins = filteredAnalyses.filter((analysis) => analysis.over2_5).length;
	const bothAboveLeagueAverage = filteredAnalyses.filter(
		(analysis) => analysis.bothTeamsAboveLeagueAverage
	);
	const bothAboveLeagueAverageWins = bothAboveLeagueAverage.filter((analysis) => analysis.over2_5).length;

	return {
		availableLeagues,
		selectedLeagueId: requestedLeagueId || null,
		analyses: filteredAnalyses.reverse(),
		summary: {
			fixtures: filteredAnalyses.length,
			over2_5Percentage:
				filteredAnalyses.length === 0 ? null : (over2_5Wins / filteredAnalyses.length) * 100,
			bothAboveLeagueAverageFixtures: bothAboveLeagueAverage.length,
			bothAboveLeagueAveragePercentage:
				bothAboveLeagueAverage.length === 0
					? null
					: (bothAboveLeagueAverageWins / bothAboveLeagueAverage.length) * 100
		}
	};
}
