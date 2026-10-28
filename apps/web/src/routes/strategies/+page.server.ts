import { redirect } from '@sveltejs/kit';

export function load({ url }: { url: URL }) {
	throw redirect(308, `/strategies/over-2-5${url.search}`);
}
