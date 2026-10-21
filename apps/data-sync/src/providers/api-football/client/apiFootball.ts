import { createApiFootballClient } from "./client.js";

let apiFootballClient: ReturnType<typeof createApiFootballClient> | undefined;

export function getApiFootballClient() {
  if (!apiFootballClient) {
    const apiKey = process.env.API_FOOTBALL_API_KEY;

    if (!apiKey) {
      throw new Error(
        "API_FOOTBALL_API_KEY must be set in apps/data-sync/.env",
      );
    }

    apiFootballClient = createApiFootballClient({ apiKey });
  }

  return apiFootballClient;
}
