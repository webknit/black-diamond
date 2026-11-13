import { error } from '@sveltejs/kit';
import { botdStrategies } from '@black-diamond/core/strategies';
import { load as loadStrategyHistory } from '../[market]/[strategyId]/+page.server.js';

export async function load({ url }: { url: URL }) {
	const strategyId = url.searchParams.get('query');
	const strategy = botdStrategies.find((item) => item.id === strategyId);
	if (!strategy) throw error(404, 'Strategy not found');
	return loadStrategyHistory({ params: { market: strategy.market.replaceAll('_', '-'), strategyId: strategy.id } });
}
