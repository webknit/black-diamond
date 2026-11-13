import type { FixtureOdds } from '../types/fixtureOdds.js';
import type { FixtureStatsSnapshot } from '../types/fixtureStatsSnapshot.js';
import { bttnsStrategyVariations, matchesBttnsStrategyVariation } from './bttnsStrategies.js';
import { bttsStrategyVariations, matchesBttsStrategyVariation } from './bttsStrategies.js';
import { leagueRateStrategyVariations, matchesLeagueRateStrategyVariation, type LeagueRateContext } from './leagueRateStrategies.js';
import { matchesOver1_5StrategyVariation, over1_5StrategyVariations } from './over1_5Strategies.js';
import { matchesOver2_5RateStrategyVariation, over2_5RateStrategyVariations } from './over2_5RateStrategies.js';
import { matchesOver3_5StrategyVariation, over3_5StrategyVariations } from './over3_5Strategies.js';
import { matchesUnder2_5StrategyVariation, under2_5StrategyVariations } from './under2_5Strategies.js';
import { matchesUnder3_5StrategyVariation, under3_5StrategyVariations } from './under3_5Strategies.js';
import { matchesUnder1_5StrategyVariation, under1_5StrategyVariations } from './under1_5Strategies.js';
import { matchesOver0_5StrategyVariation, over0_5StrategyVariations } from './over0_5Strategies.js';
import { matchesTeamFilterVariation, teamFilterVariations } from './strategies.js';

export type BotdMarket = 'over2_5' | 'over3_5' | 'under3_5' | 'under2_5' | 'over1_5' | 'under1_5' | 'over0_5' | 'btts' | 'bttns';

export type BotdStrategy = {
	id: string;
	title: string;
	description: string;
	market: BotdMarket;
};

function asBotdStrategy(
	strategy: Pick<BotdStrategy, 'id' | 'title' | 'description'>,
	market: BotdMarket
): BotdStrategy {
	const marketLabel = getBotdMarketLabel(market);
	return {
		...strategy,
		title: `${marketLabel} · ${strategy.title}`,
		description: `Bet: ${marketLabel}. ${strategy.description}`,
		market
	};
}

export const botdStrategies: BotdStrategy[] = [
	...teamFilterVariations
		.filter((strategy) => strategy.sample === 'last5')
		.map((strategy) => asBotdStrategy(strategy, 'over2_5')),
	...over2_5RateStrategyVariations.map((strategy) => asBotdStrategy(strategy, 'over2_5')),
	...over3_5StrategyVariations.map((strategy) => asBotdStrategy(strategy, 'over3_5')),
	...under2_5StrategyVariations.map((strategy) => asBotdStrategy(strategy, 'under2_5')),
	...under3_5StrategyVariations.map((strategy) => asBotdStrategy(strategy, 'under3_5')),
	...under1_5StrategyVariations.map((strategy) => asBotdStrategy(strategy, 'under1_5')),
	...over0_5StrategyVariations.map((strategy) => asBotdStrategy(strategy, 'over0_5')),
	...over1_5StrategyVariations.map((strategy) => asBotdStrategy(strategy, 'over1_5')),
	...bttsStrategyVariations
		.filter((strategy) => strategy.sample === 'last5')
		.map((strategy) => asBotdStrategy(strategy, 'btts')),
	...bttnsStrategyVariations.map((strategy) => asBotdStrategy(strategy, 'bttns')),
	...leagueRateStrategyVariations.map((strategy) => asBotdStrategy(strategy, strategy.market))
];

export function matchesBotdStrategy(snapshot: FixtureStatsSnapshot, league: LeagueRateContext | undefined, strategy: BotdStrategy): boolean {
	const teamFilter = teamFilterVariations.find((variation) => variation.id === strategy.id);
	if (teamFilter) return matchesTeamFilterVariation(snapshot, teamFilter);
	const over2_5Rate = over2_5RateStrategyVariations.find((variation) => variation.id === strategy.id);
	if (over2_5Rate) return matchesOver2_5RateStrategyVariation(snapshot, over2_5Rate);
	const over3_5 = over3_5StrategyVariations.find((variation) => variation.id === strategy.id);
	if (over3_5) return matchesOver3_5StrategyVariation(snapshot, over3_5);
	const under2_5 = under2_5StrategyVariations.find((variation) => variation.id === strategy.id);
	if (under2_5) return matchesUnder2_5StrategyVariation(snapshot, under2_5);
	const under3_5 = under3_5StrategyVariations.find((variation) => variation.id === strategy.id);
	if (under3_5) return matchesUnder3_5StrategyVariation(snapshot, under3_5);
	const under1_5 = under1_5StrategyVariations.find((variation) => variation.id === strategy.id);
	if (under1_5) return matchesUnder1_5StrategyVariation(snapshot, under1_5);
	const over0_5 = over0_5StrategyVariations.find((variation) => variation.id === strategy.id);
	if (over0_5) return matchesOver0_5StrategyVariation(snapshot, over0_5);
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
	const value = market === 'over2_5' ? 'over 2.5' : market === 'over3_5' ? 'over 3.5' : market === 'under3_5' ? 'under 3.5' : market === 'under2_5' ? 'under 2.5' : market === 'over1_5' ? 'over 1.5' : market === 'under1_5' ? 'under 1.5' : market === 'over0_5' ? 'over 0.5' : market === 'btts' ? 'yes' : 'no';
	const odd = Number(oddsMarket?.values.find((item) => item.value.trim().toLowerCase() === value)?.odd);
	return Number.isFinite(odd) && odd > 1 ? odd : null;
}

export function getBotdMarketLabel(market: BotdMarket): string {
	return market === 'over2_5' ? 'Over 2.5' : market === 'over3_5' ? 'Over 3.5' : market === 'under3_5' ? 'Under 3.5' : market === 'under2_5' ? 'Under 2.5' : market === 'over1_5' ? 'Over 1.5' : market === 'under1_5' ? 'Under 1.5' : market === 'over0_5' ? 'Over 0.5' : market === 'btts' ? 'BTTS' : 'BTNTS';
}
