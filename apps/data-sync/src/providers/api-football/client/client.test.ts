import { describe, expect, it, vi } from "vitest";
import { createApiFootballClient } from "./client.js";

describe("createApiFootballClient", () => {
  it("sends a GET request with only the API-Football key header", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ response: [] }),
    });
    const rateLimiter = { waitForTurn: vi.fn() };
    const client = createApiFootballClient({
      apiKey: "test-key",
      fetch: fetch as unknown as typeof globalThis.fetch,
      rateLimiter,
    });

    await client.get("/teams", { league: 39, season: 2026, unused: undefined });

    const [url, options] = fetch.mock.calls[0];
    expect(url.toString()).toBe(
      "https://v3.football.api-sports.io/teams?league=39&season=2026",
    );
    expect(options).toEqual({
      method: "GET",
      headers: { "x-apisports-key": "test-key" },
    });
    expect(rateLimiter.waitForTurn).toHaveBeenCalledOnce();
  });

  it("rejects an empty API key", () => {
    expect(() => createApiFootballClient({ apiKey: " " })).toThrow(
      "API_FOOTBALL_API_KEY must be provided",
    );
  });

  it("includes HTTP status and response body in errors", async () => {
    const body = { message: "Not authorised" };
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify(body),
    });
    const client = createApiFootballClient({
      apiKey: "test-key",
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    await expect(client.get("/teams")).rejects.toMatchObject({
      name: "ApiFootballHttpError",
      status: 401,
      body,
    });
  });

  it("reports a non-JSON response without leaking the whole response body", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "<html>Too many requests</html>",
    });
    const client = createApiFootballClient({
      apiKey: "test-key",
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    await expect(client.get("/odds")).rejects.toMatchObject({
      name: "ApiFootballHttpError",
      status: 429,
      body: "<html>Too many requests</html>",
    });
  });

  it("identifies a successful HTTP response that contains HTML instead of JSON", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "<html>Blocked</html>",
    });
    const client = createApiFootballClient({
      apiKey: "test-key",
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    await expect(client.get("/odds")).rejects.toThrow(
      "API-Football returned a non-JSON response with HTTP 200: <html>Blocked</html>",
    );
  });
});
