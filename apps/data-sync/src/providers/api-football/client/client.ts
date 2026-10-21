const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";

type QueryValue = string | number | boolean | undefined;

export type ApiFootballClientOptions = {
  apiKey: string;
  fetch?: typeof globalThis.fetch;
};

export function createApiFootballClient({
  apiKey,
  fetch = globalThis.fetch,
}: ApiFootballClientOptions) {
  if (!apiKey.trim()) {
    throw new Error("API_FOOTBALL_API_KEY must be provided");
  }

  async function get<ResponseBody = unknown>(
    path: string,
    query: Record<string, QueryValue> = {},
  ): Promise<ResponseBody> {
    const url = new URL(path, API_FOOTBALL_BASE_URL);

    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(name, String(value));
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
    });

    const body: unknown = await response.json();

    if (!response.ok) {
      throw createApiFootballHttpError(response.status, body);
    }

    return body as ResponseBody;
  }

  return { get };
}

export type ApiFootballHttpError = Error & {
  status: number;
  body: unknown;
};

function createApiFootballHttpError(
  status: number,
  body: unknown,
): ApiFootballHttpError {
  return Object.assign(
    new Error(`API-Football request failed with HTTP ${status}`),
    {
      name: "ApiFootballHttpError",
      status,
      body,
    },
  );
}
