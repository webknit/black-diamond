import type { Account } from "@black-diamond/core/account";

import { getDatabase } from "../../mongodb.js";

export async function getAccountById(id: string): Promise<Account | null> {
  const database = await getDatabase();

  return database.collection<Account>("accounts").findOne({ id });
}
