import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getFinishedFixturesForAnalysis } from '@black-diamond/database/fixtureStatsSnapshots';
import { matchesOver25Strategy } from '#lib/server/strategies/matchesOver25Strategy.js';

type LeagueTotals = { fixtures: number; over2_5: number };
type TeamHistory = boolean[];
type PatternTotals = { fixtures: number; over2_5: number; leagueOver2_5Total: number };

const analysesPerPage = 50;

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

function getOver2_5Band(value: number) {
	if (value < 40) return '<40%';
	if (value < 50) return '40–49.9%';
	if (value < 60) return '50–59.9%';
	return '60%+';
}

function addToPattern(
	patterns: Map<string, PatternTotals>,
	key: string,
	over2_5: boolean,
	leagueOver2_5Percentage: number | null
) {
	const existing = patterns.get(key) ?? { fixtures: 0, over2_5: 0, leagueOver2_5Total: 0 };

	patterns.set(key, {
		fixtures: existing.fixtures + 1,
		over2_5: existing.over2_5 + Number(over2_5),
		leagueOver2_5Total: existing.leagueOver2_5Total + (leagueOver2_5Percentage ?? 0)
	});
}

function toPatternRows(patterns: Map<string, PatternTotals>) {
	return [...patterns.entries()]
		.map(([label, totals]) => {
			const over2_5Percentage = (totals.over2_5 / totals.fixtures) * 100;
			const leagueOver2_5Percentage = totals.leagueOver2_5Total / totals.fixtures;

			return {
				label,
				fixtures: totals.fixtures,
				over2_5Percentage,
				leagueOver2_5Percentage,
				difference: over2_5Percentage - leagueOver2_5Percentage
			};
		})
		.sort((left, right) => left.label.localeCompare(right.label));
}

export async function load({ url }: { url: URL }) {
	const requestedLeagueId = Number(url.searchParams.get('league'));
	const requestedPage = Number(url.searchParams.get('page'));
	const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
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
	const leaguePatterns = new Map<
		number,
		{
			league: (typeof filteredAnalyses)[number]['league'];
			fixtures: number;
			over2_5: number;
			bothTeamsAboveLeagueAverageFixtures: number;
			bothTeamsAboveLeagueAverageWins: number;
		}
	>();
	const homeOver2_5Bands = new Map<string, PatternTotals>();
	const awayOver2_5Bands = new Map<string, PatternTotals>();

	for (const analysis of filteredAnalyses) {
		const existingLeaguePattern = leaguePatterns.get(analysis.league.id) ?? {
			league: analysis.league,
			fixtures: 0,
			over2_5: 0,
			bothTeamsAboveLeagueAverageFixtures: 0,
			bothTeamsAboveLeagueAverageWins: 0
		};

		leaguePatterns.set(analysis.league.id, {
			...existingLeaguePattern,
			fixtures: existingLeaguePattern.fixtures + 1,
			over2_5: existingLeaguePattern.over2_5 + Number(analysis.over2_5),
			bothTeamsAboveLeagueAverageFixtures:
				existingLeaguePattern.bothTeamsAboveLeagueAverageFixtures +
				Number(analysis.bothTeamsAboveLeagueAverage),
			bothTeamsAboveLeagueAverageWins:
				existingLeaguePattern.bothTeamsAboveLeagueAverageWins +
				Number(analysis.bothTeamsAboveLeagueAverage && analysis.over2_5)
		});

		addToPattern(
			homeOver2_5Bands,
			getOver2_5Band(analysis.homeOver2_5Percentage),
			analysis.over2_5,
			analysis.leagueOver2_5Percentage
		);
		addToPattern(
			awayOver2_5Bands,
			getOver2_5Band(analysis.awayOver2_5Percentage),
			analysis.over2_5,
			analysis.leagueOver2_5Percentage
		);
	}
	const analysesInReverseChronologicalOrder = filteredAnalyses.reverse();
	const totalPages = Math.max(1, Math.ceil(analysesInReverseChronologicalOrder.length / analysesPerPage));
	const currentPage = Math.min(page, totalPages);
	const firstAnalysisIndex = (currentPage - 1) * analysesPerPage;

	return {
		availableLeagues,
		selectedLeagueId: requestedLeagueId || null,
		analyses: analysesInReverseChronologicalOrder.slice(
			firstAnalysisIndex,
			firstAnalysisIndex + analysesPerPage
		),
		pagination: {
			currentPage,
			totalPages,
			firstResult: analysesInReverseChronologicalOrder.length === 0 ? 0 : firstAnalysisIndex + 1,
			lastResult: Math.min(firstAnalysisIndex + analysesPerPage, analysesInReverseChronologicalOrder.length),
			totalResults: analysesInReverseChronologicalOrder.length
		},
		leaguePatterns: [...leaguePatterns.values()]
			.map((pattern) => ({
				league: pattern.league,
				fixtures: pattern.fixtures,
				over2_5Percentage: (pattern.over2_5 / pattern.fixtures) * 100,
				bothTeamsAboveLeagueAverageFixtures: pattern.bothTeamsAboveLeagueAverageFixtures,
				bothTeamsAboveLeagueAveragePercentage:
					pattern.bothTeamsAboveLeagueAverageFixtures === 0
						? null
						: (pattern.bothTeamsAboveLeagueAverageWins /
								pattern.bothTeamsAboveLeagueAverageFixtures) *
							100,
				bothTeamsAboveLeagueAverageDifference:
					pattern.bothTeamsAboveLeagueAverageFixtures === 0
						? null
						: (pattern.bothTeamsAboveLeagueAverageWins /
								pattern.bothTeamsAboveLeagueAverageFixtures) *
							100 -
							(pattern.over2_5 / pattern.fixtures) * 100
			}))
			.sort((left, right) => right.over2_5Percentage - left.over2_5Percentage),
		homeOver2_5Bands: toPatternRows(homeOver2_5Bands),
		awayOver2_5Bands: toPatternRows(awayOver2_5Bands),
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
