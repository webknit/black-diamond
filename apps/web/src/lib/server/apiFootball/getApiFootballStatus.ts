const apiFootballBaseUrl = 'https://v3.football.api-sports.io';

type ApiFootballStatusBody = {
	response?: {
		subscription?: {
			plan?: string;
			active?: boolean;
			end?: string;
		};
		requests?: {
			current?: number;
			limit_day?: number;
		};
	};
};

export type ApiFootballStatus = {
	plan: string | null;
	isSubscriptionActive: boolean | null;
	subscriptionEndsAt: string | null;
	daily: {
		used: number | null;
		limit: number | null;
		remaining: number | null;
	};
	perMinute: {
		limit: number | null;
		remaining: number | null;
	};
};

function getHeaderNumber(headers: Headers, name: string): number | null {
	const value = headers.get(name);
	if (!value) return null;
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

export async function getApiFootballStatus(apiKey: string): Promise<ApiFootballStatus> {
	const response = await fetch(`${apiFootballBaseUrl}/status`, {
		headers: { 'x-apisports-key': apiKey }
	});

	const responseText = await response.text();
	let body: ApiFootballStatusBody;
	try {
		body = JSON.parse(responseText) as ApiFootballStatusBody;
	} catch {
		throw new Error('API-Football returned an invalid response.');
	}

	if (!response.ok) {
		throw new Error(`API-Football status request failed (${response.status}).`);
	}

	const used = body.response?.requests?.current ?? null;
	const limit = body.response?.requests?.limit_day ?? getHeaderNumber(response.headers, 'x-ratelimit-requests-limit');
	const remainingFromHeader = getHeaderNumber(response.headers, 'x-ratelimit-requests-remaining');

	return {
		plan: body.response?.subscription?.plan ?? null,
		isSubscriptionActive: body.response?.subscription?.active ?? null,
		subscriptionEndsAt: body.response?.subscription?.end ?? null,
		daily: {
			used,
			limit,
			remaining: remainingFromHeader ?? (used !== null && limit !== null ? Math.max(0, limit - used) : null)
		},
		perMinute: {
			limit: getHeaderNumber(response.headers, 'x-ratelimit-limit'),
			remaining: getHeaderNumber(response.headers, 'x-ratelimit-remaining')
		}
	};
}
