import { createRateLimiter } from "./rateLimiter.js";

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
// Leave room below the provider limit for another scheduled job that happens
// to overlap briefly with this process.
const REQUEST_INTERVAL_MS = 1000 / 4;
const MAX_RATE_LIMIT_RETRIES = 3;
const DEFAULT_RATE_LIMIT_RETRY_MS = 10_000;

type QueryValue = string | number | boolean | undefined;

export type ApiFootballClientOptions = {
  apiKey: string;
  fetch?: typeof globalThis.fetch;
  rateLimiter?: { waitForTurn: () => Promise<void> };
  sleep?: (milliseconds: number) => Promise<void>;
};

export function createApiFootballClient({
  apiKey,
  fetch = globalThis.fetch,
  rateLimiter = createRateLimiter({ minimumIntervalMs: REQUEST_INTERVAL_MS }),
  sleep = (milliseconds) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)),
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

    for (let attempt = 0; ; attempt += 1) {
      await rateLimiter.waitForTurn();

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey,
        },
      });

      const responseText = await response.text();
      const body = parseResponseBody(responseText);

      if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
        const retryMilliseconds = getRetryMilliseconds(response.headers, attempt);
        console.warn(
          `[api-football] Rate limited. Retrying ${path} in ${Math.ceil(retryMilliseconds / 1000)}s (attempt ${attempt + 1}/${MAX_RATE_LIMIT_RETRIES}).`,
        );
        await sleep(retryMilliseconds);
        continue;
      }

      if (!response.ok) {
        if (body === undefined) {
          throw createApiFootballNonJsonHttpError(response.status, responseText);
        }

        throw createApiFootballHttpError(response.status, body);
      }

      if (body === undefined) {
        throw createApiFootballInvalidResponseError(response.status, responseText);
      }

      return body as ResponseBody;
    }
  }

  return { get };
}

function getRetryMilliseconds(headers: Headers | undefined, attempt: number): number {
  const retryAfter = Number(headers?.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;

  return DEFAULT_RATE_LIMIT_RETRY_MS * (attempt + 1);
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

function createApiFootballInvalidResponseError(
  status: number,
  responseText: string,
): ApiFootballHttpError {
  return Object.assign(
    new Error(
      `API-Football returned a non-JSON response with HTTP ${status}: ${getResponseExcerpt(responseText)}`,
    ),
    {
      name: "ApiFootballInvalidResponseError",
      status,
      body: responseText,
    },
  );
}

function createApiFootballNonJsonHttpError(
  status: number,
  responseText: string,
): ApiFootballHttpError {
  const excerpt = getResponseExcerpt(responseText);

  return Object.assign(
    new Error(
      `API-Football request failed with HTTP ${status} and a non-JSON response: ${excerpt}`,
    ),
    {
      name: "ApiFootballHttpError",
      status,
      body: excerpt,
    },
  );
}

function parseResponseBody(responseText: string): unknown | undefined {
  if (!responseText.trim()) return undefined;

  try {
    return JSON.parse(responseText);
  } catch {
    return undefined;
  }
}

function getResponseExcerpt(responseText: string): string {
  return responseText.replace(/\s+/g, " ").trim().slice(0, 200);
}
