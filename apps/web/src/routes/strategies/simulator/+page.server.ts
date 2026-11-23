import { botdStrategies, getBettableMinimumOdds, getBotdMarketLabel, getBotdStrategyEvidenceScope, type BotdMarket } from '@black-diamond/core/strategies';
import { getBotdDays } from '@black-diamond/database/botdDays';
import { getFixturesByIds } from '@black-diamond/database/fixtures';
import { chooseFixtureCandidates, diversifyTopCandidates, getTierScore, type BotdCandidate } from '../../../lib/server/botdSelection.js';

const defaultStartingBank = 1_000;
const defaultStake = 10;
const completedStatuses = new Set(['FT', 'AET', 'PEN']);
const modes = ['top', 'eligible', 'strong', 'all'] as const;
type Mode = (typeof modes)[number];

function readAmount(value: string | null, fallback: number, maximum: number) {
	const amount = Number(value);
	return Number.isFinite(amount) && amount > 0 ? Math.min(amount, maximum) : fallback;
}
function subtractDays(value: string, days: number) {
	const date = new Date(`${value}T12:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() - days);
	return date.toISOString().slice(0, 10);
}
function didWin(market: BotdMarket, homeGoals: number, awayGoals: number) {
	const goals = homeGoals + awayGoals;
	return market === 'over2_5' ? goals > 2 : market === 'over3_5' ? goals > 3 : market === 'over1_5' ? goals > 1
		: market === 'over0_5' ? goals > 0 : market === 'under3_5' ? goals < 4 : market === 'under2_5' ? goals < 3
		: market === 'under1_5' ? goals < 2 : market === 'btts' ? homeGoals > 0 && awayGoals > 0 : homeGoals === 0 || awayGoals === 0;
}
function selectDailyRecommendations(candidates: BotdCandidate[], mode: Mode) {
	const minimumTier = mode === 'strong' ? 3 : mode === 'all' ? 1 : 2;
	const recommendations = chooseFixtureCandidates(candidates.filter((candidate) => getTierScore(candidate.tier) >= minimumTier));
	return mode === 'top' ? diversifyTopCandidates(recommendations.filter((candidate) => candidate.evidenceScope !== 'leagueOnly')).slice(0, 10) : recommendations;
}

export async function load({ url }: { url: URL }) {
	const botdDays = await getBotdDays();
	const earliestDate = botdDays[0]?.fixtureDate ?? null;
	const latestDate = botdDays.at(-1)?.fixtureDate ?? null;
	const requestedStart = url.searchParams.get('start');
	const requestedEnd = url.searchParams.get('end');
	const start = requestedStart && earliestDate && requestedStart >= earliestDate && requestedStart <= (latestDate ?? requestedStart) ? requestedStart : latestDate ? subtractDays(latestDate, 29) : '';
	const end = requestedEnd && latestDate && requestedEnd >= (earliestDate ?? requestedEnd) && requestedEnd <= latestDate ? requestedEnd : latestDate ?? '';
	const mode = modes.includes(url.searchParams.get('mode') as Mode) ? url.searchParams.get('mode') as Mode : 'top';
	const startingBank = readAmount(url.searchParams.get('bank'), defaultStartingBank, 1_000_000);
	const stake = readAmount(url.searchParams.get('stake'), defaultStake, 100_000);
	const selectedDays = botdDays.filter((day) => day.fixtureDate >= start && day.fixtureDate <= end);
	const selectionsByFixtureId = new Map<number, BotdCandidate & { date: string }>();
	for (const day of selectedDays) {
		const candidates = day.fixtures.flatMap((fixture) => fixture.matches.flatMap((match) => {
			const strategy = botdStrategies.find((item) => item.id === match.strategyId);
			if (!strategy || match.referenceOdd === null || match.referenceOdd < getBettableMinimumOdds(strategy.market)) return [];
			return [{ ...match, fixtureId: fixture.fixtureId, leagueId: fixture.leagueId, market: strategy.market, marketLabel: getBotdMarketLabel(strategy.market), strategyTitle: strategy.title, evidenceScope: getBotdStrategyEvidenceScope(strategy) } satisfies BotdCandidate];
		}));
		for (const candidate of selectDailyRecommendations(candidates, mode)) {
			// A rescheduled fixture can remain in an earlier cached BotD day. Keep its latest slate entry once.
			selectionsByFixtureId.set(candidate.fixtureId, { ...candidate, date: day.fixtureDate });
		}
	}
	const dailySelections = [...selectionsByFixtureId.values()];
	const fixtures = await getFixturesByIds(dailySelections.map((selection) => selection.fixtureId));
	const fixturesById = new Map(fixtures.map((fixture) => [fixture.fixture.id, fixture]));
	const settledSelections = dailySelections.map((selection) => ({ selection, fixture: fixturesById.get(selection.fixtureId) }))
		.filter((item) => item.fixture && completedStatuses.has(item.fixture.fixture.status.short) && item.fixture.goals.home !== null && item.fixture.goals.away !== null)
		.sort((left, right) => left.fixture!.fixture.timestamp - right.fixture!.fixture.timestamp);
	let bank = startingBank;
	let peakBank = bank;
	let maximumDrawdown = 0;
	let skippedBets = 0;
	const bets = settledSelections.flatMap(({ selection, fixture }) => {
		if (bank < stake) { skippedBets++; return []; }
		const won = didWin(selection.market, fixture!.goals.home!, fixture!.goals.away!);
		const profit = Number((won ? stake * (selection.referenceOdd! - 1) : -stake).toFixed(2));
		bank = Number((bank + profit).toFixed(2)); peakBank = Math.max(peakBank, bank); maximumDrawdown = Math.max(maximumDrawdown, peakBank - bank);
		return [{ fixtureId: selection.fixtureId, date: selection.date, strategyTitle: selection.strategyTitle, market: selection.marketLabel, tier: selection.tier, league: fixture!.league.name, match: `${fixture!.teams.home.name} v ${fixture!.teams.away.name}`, score: `${fixture!.goals.home}–${fixture!.goals.away}`, odds: selection.referenceOdd!, won, profit, bankAfter: bank }];
	});
	const wins = bets.filter((bet) => bet.won).length;
	const profit = Number((bank - startingBank).toFixed(2));
	return { earliestDate, latestDate, start, end, mode, startingBank, stake, availableDays: selectedDays.length,
		results: { betCount: bets.length, wins, losses: bets.length - wins, profit, endingBank: bank, skippedBets, pendingCount: dailySelections.length - settledSelections.length, returnOnInvestment: bets.length === 0 ? null : (profit / (bets.length * stake)) * 100, maximumDrawdown, bets: bets.reverse() } };
}
