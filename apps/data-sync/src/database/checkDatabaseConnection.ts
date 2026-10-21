import { getDatabase } from "@black-diamond/database/mongodb";

export async function checkDatabaseConnection() {
  const database = await getDatabase();

  await database.command({ ping: 1 });

  return database.databaseName;
}
