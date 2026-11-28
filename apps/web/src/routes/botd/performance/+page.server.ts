import { getBotdDays } from '@black-diamond/database/botdDays';
import { getFixturesByIds } from '@black-diamond/database/fixtures';
import { botdStrategies, getBettableMinimumOdds, getBotdMarketLabel, getBotdStrategyEvidenceScope, isBotdBaseStrategy, type BotdMarket } from '@black-diamond/core/strategies';
import { chooseFixtureCandidates, diversifyTopCandidates, getTierScore, type BotdCandidate } from '../../../lib/server/botdSelection.js';

const completedStatuses = new Set(['FT', 'AET', 'PEN']);
const categories = [
	{ id: 'top', label: 'Top Picks', description: 'Team-evidence recommendations, diversified to at most two per league.' },
	{ id: 'highConfidence', label: 'High confidence', description: 'Recommendations with 100 or more qualifying historical bets.' },
	{ id: 'strong', label: 'Strong', description: 'Recommendations in the Strong confidence band only.' },
	{ id: 'eligible', label: 'Eligible', description: 'Recommendations in the Eligible confidence band only.' },
	{ id: 'lowConfidence', label: 'Low confidence', description: 'Recommendations with 20–29 qualifying historical bets.' },
	{ id: 'emerging', label: 'Emerging', description: 'Recommendations with 5–19 qualifying historical bets.' }
] as const;

type Category = (typeof categories)[number];
type Selection = BotdCandidate & { date: string };

function didWin(market: BotdMarket, homeGoals: number, awayGoals: number) {
	const goals = homeGoals + awayGoals;
	return market === 'over2_5' ? goals > 2 : market === 'over3_5' ? goals > 3 : market === 'over1_5' ? goals > 1
		: market === 'over0_5' ? goals > 0 : market === 'under3_5' ? goals < 4 : market === 'under2_5' ? goals < 3
		: market === 'under1_5' ? goals < 2 : market === 'btts' ? homeGoals > 0 && awayGoals > 0 : homeGoals === 0 || awayGoals === 0;
}

function getStrategyTitle(title: string, marketLabel: string) {
	let result = title;
	while (result.startsWith(`${marketLabel} · `)) result = result.slice(marketLabel.length + 3);
	return result;
}

function selectRecommendations(candidates: BotdCandidate[], category: Category['id']) {
	const selectedCandidates = category === 'top'
		? candidates.filter((candidate) => getTierScore(candidate.tier) >= 3)
		: candidates.filter((candidate) => candidate.tier === category);
	const recommendations = chooseFixtureCandidates(selectedCandidates);
	return category === 'top'
		? diversifyTopCandidates(recommendations.filter((candidate) => candidate.evidenceScope !== 'leagueOnly')).slice(0, 10)
		: recommendations;
}

function getCandidates(day: Awaited<ReturnType<typeof getBotdDays>>[number]) {
	return day.fixtures.flatMap((fixture) => fixture.matches.flatMap((match) => {
		const strategy = botdStrategies.find((item) => item.id === match.strategyId);
		if (!strategy || isBotdBaseStrategy(strategy) || match.referenceOdd === null || match.referenceOdd < getBettableMinimumOdds(strategy.market)) return [];
		return [{
			...match,
			fixtureId: fixture.fixtureId,
			leagueId: fixture.leagueId,
			market: strategy.market,
			marketLabel: getBotdMarketLabel(strategy.market),
			strategyTitle: getStrategyTitle(strategy.title, getBotdMarketLabel(strategy.market)),
			evidenceScope: getBotdStrategyEvidenceScope(strategy)
		} satisfies BotdCandidate];
	}));
}

export async function load() {
	const botdDays = await getBotdDays();
	const selectionsByCategory = new Map<Category['id'], Selection[]>();

	for (const category of categories) {
		const selectionsByFixtureId = new Map<number, Selection>();
		for (const day of botdDays) {
			for (const selection of selectRecommendations(getCandidates(day), category.id)) {
				// Cached BotD days can retain a rescheduled fixture. The latest slate wins.
				selectionsByFixtureId.set(selection.fixtureId, { ...selection, date: day.fixtureDate });
			}
		}
		selectionsByCategory.set(category.id, [...selectionsByFixtureId.values()]);
	}

	const fixtureIds = [...new Set([...selectionsByCategory.values()].flatMap((selections) => selections.map((selection) => selection.fixtureId)))];
	const fixtures = await getFixturesByIds(fixtureIds);
	const fixturesById = new Map(fixtures.map((fixture) => [fixture.fixture.id, fixture]));
	const performance = categories.map((category) => {
		const selections = selectionsByCategory.get(category.id) ?? [];
		const marketPerformance = new Map<string, { market: string; selectionCount: number; settledCount: number; wins: number; profitLoss: number; totalOdds: number }>();
		for (const selection of selections) {
			const current = marketPerformance.get(selection.marketLabel) ?? { market: selection.marketLabel, selectionCount: 0, settledCount: 0, wins: 0, profitLoss: 0, totalOdds: 0 };
			current.selectionCount++;
			marketPerformance.set(selection.marketLabel, current);
		}
		const settled = selections.flatMap((selection) => {
			const fixture = fixturesById.get(selection.fixtureId);
			if (!fixture || !completedStatuses.has(fixture.fixture.status.short) || fixture.goals.home === null || fixture.goals.away === null) return [];
			const won = didWin(selection.market, fixture.goals.home, fixture.goals.away);
			const odd = selection.referenceOdd!;
			const current = marketPerformance.get(selection.marketLabel)!;
			current.settledCount++;
			current.wins += Number(won);
			current.profitLoss += won ? odd - 1 : -1;
			current.totalOdds += odd;
			return [{ date: selection.date, odd, won }];
		});
		const wins = settled.filter((selection) => selection.won).length;
		const profitLoss = settled.reduce((total, selection) => total + (selection.won ? selection.odd - 1 : -1), 0);
		return {
			...category,
			selectionCount: selections.length,
			totalStaked: selections.length,
			settledCount: settled.length,
			pendingCount: selections.length - settled.length,
			wins,
			losses: settled.length - wins,
			profitLoss: Number(profitLoss.toFixed(2)),
			roi: settled.length ? (profitLoss / settled.length) * 100 : null,
			averageOdds: settled.length ? settled.reduce((total, selection) => total + selection.odd, 0) / settled.length : null,
			marketPerformance: [...marketPerformance.values()]
				.map((market) => ({
					...market,
					losses: market.settledCount - market.wins,
					pendingCount: market.selectionCount - market.settledCount,
					profitLoss: Number(market.profitLoss.toFixed(2)),
					roi: market.settledCount ? (market.profitLoss / market.settledCount) * 100 : null,
					averageOdds: market.settledCount ? market.totalOdds / market.settledCount : null
				}))
				.sort((left, right) => left.market.localeCompare(right.market))
		};
	});
	const performanceSeries = performance.map((category) => {
		const selections = selectionsByCategory.get(category.id) ?? [];
		const dailyProfitLoss = new Map<string, number>();
		for (const selection of selections) {
			const fixture = fixturesById.get(selection.fixtureId);
			if (!fixture || !completedStatuses.has(fixture.fixture.status.short) || fixture.goals.home === null || fixture.goals.away === null) continue;
			const profit = didWin(selection.market, fixture.goals.home, fixture.goals.away) ? selection.referenceOdd! - 1 : -1;
			dailyProfitLoss.set(selection.date, (dailyProfitLoss.get(selection.date) ?? 0) + profit);
		}
		return { id: category.id, label: category.label, points: [...dailyProfitLoss.entries()].map(([date, profitLoss]) => ({ date, profitLoss: Number(profitLoss.toFixed(2)) })).sort((left, right) => left.date.localeCompare(right.date)) };
	});

	return { availableDays: botdDays.length, performance, performanceSeries };
}
