import type { Account } from "@black-diamond/core/account";

import { getDatabase } from "../../mongodb.js";

export async function createAccount(account: Account): Promise<void> {
  const database = await getDatabase();

  await database.collection<Account>("accounts").insertOne(account);
}
