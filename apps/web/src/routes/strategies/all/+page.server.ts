import {
	botdStrategies,
	getBotdMarketLabel,
	getBotdStrategyEvidenceScope,
	isBotdBaseStrategy,
	type BotdMarket
} from '@black-diamond/core/strategies';

const marketOrder: BotdMarket[] = [
	'over0_5',
	'over1_5',
	'over2_5',
	'over3_5',
	'under1_5',
	'under2_5',
	'under3_5',
	'btts',
	'bttns'
];

export function load() {
	return {
		markets: marketOrder.map((market) => ({
			market,
			label: getBotdMarketLabel(market),
			strategies: botdStrategies
				.filter((strategy) => strategy.market === market)
				.map((strategy) => ({
					...strategy,
					evidenceScope: getBotdStrategyEvidenceScope(strategy),
					baseOnly: isBotdBaseStrategy(strategy)
				}))
		}))
	};
}
