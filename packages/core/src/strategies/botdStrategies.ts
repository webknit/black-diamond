import type { FixtureOdds } from '../types/fixtureOdds.js';
import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';
import { bttnsStrategyVariations, matchesBttnsStrategyVariation } from './bttnsStrategies.js';
import { bttsStrategyVariations, matchesBttsStrategyVariation } from './bttsStrategies.js';
import { leagueRateStrategyVariations, matchesLeagueRateStrategyVariation, type LeagueRateContext } from './leagueRateStrategies.js';
import { matchesOver1_5StrategyVariation, over1_5StrategyVariations } from './over1_5Strategies.js';
import { matchesOver2_5RateStrategyVariation, over2_5RateStrategyVariations } from './over2_5RateStrategies.js';
import { matchesTeamFilterVariation, teamFilterVariations } from './strategies.js';

export type BotdMarket = 'over2_5' | 'over1_5' | 'btts' | 'bttns';

export type BotdStrategy = {
	id: string;
	title: string;
	description: string;
	market: BotdMarket;
};

export const botdStrategies: BotdStrategy[] = [
	...teamFilterVariations
		.filter((strategy) => strategy.sample === 'last5')
		.map((strategy) => ({ ...strategy, market: 'over2_5' as const })),
	...over2_5RateStrategyVariations.map((strategy) => ({ ...strategy, market: 'over2_5' as const })),
	...over1_5StrategyVariations.map((strategy) => ({ ...strategy, market: 'over1_5' as const })),
	...bttsStrategyVariations
		.filter((strategy) => strategy.sample === 'last5')
		.map((strategy) => ({ ...strategy, market: 'btts' as const })),
	...bttnsStrategyVariations.map((strategy) => ({ ...strategy, market: 'bttns' as const })),
	...leagueRateStrategyVariations.map((strategy) => ({ ...strategy, market: strategy.market }))
];

export function matchesBotdStrategy(snapshot: FixtureStatsSnapshot, league: LeagueRateContext | undefined, strategy: BotdStrategy): boolean {
	const teamFilter = teamFilterVariations.find((variation) => variation.id === strategy.id);
	if (teamFilter) return matchesTeamFilterVariation(snapshot, teamFilter);
	const over2_5Rate = over2_5RateStrategyVariations.find((variation) => variation.id === strategy.id);
	if (over2_5Rate) return matchesOver2_5RateStrategyVariation(snapshot, over2_5Rate);
	const over1_5 = over1_5StrategyVariations.find((variation) => variation.id === strategy.id);
	if (over1_5) return matchesOver1_5StrategyVariation(snapshot, over1_5);
	const btts = bttsStrategyVariations.find((variation) => variation.id === strategy.id);
	if (btts) return matchesBttsStrategyVariation(snapshot, btts);
	const bttns = bttnsStrategyVariations.find((variation) => variation.id === strategy.id);
	if (bttns) return matchesBttnsStrategyVariation(snapshot, bttns);
	const leagueRate = leagueRateStrategyVariations.find((variation) => variation.id === strategy.id);
	return Boolean(leagueRate && league && matchesLeagueRateStrategyVariation(snapshot, league, leagueRate));
}

type OddsMarket = Pick<FixtureOdds['odds'][number], 'name' | 'values'>;

export function getBotdReferenceOdd(odds: ReadonlyArray<OddsMarket>, market: BotdMarket): number | null {
	const oddsMarket = market === 'btts' || market === 'bttns'
		? odds.find((item) => item.name.trim().toLowerCase() === 'both teams score')
		: odds.find((item) => ['goals over/under', 'goals over under'].includes(item.name.trim().toLowerCase()));
	const value = market === 'over2_5' ? 'over 2.5' : market === 'over1_5' ? 'over 1.5' : market === 'btts' ? 'yes' : 'no';
	const odd = Number(oddsMarket?.values.find((item) => item.value.trim().toLowerCase() === value)?.odd);
	return Number.isFinite(odd) && odd > 1 ? odd : null;
}

export function getBotdMarketLabel(market: BotdMarket): string {
	return market === 'over2_5' ? 'Over 2.5' : market === 'over1_5' ? 'Over 1.5' : market === 'btts' ? 'BTTS' : 'BTNTS';
}
