import type { Account } from "@black-diamond/core/account";

import { getDatabase } from "../../mongodb.js";

export async function getAccountByEmail(email: string): Promise<Account | null> {
  const database = await getDatabase();

  return database.collection<Account>("accounts").findOne({ email });
}
