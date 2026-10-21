import { Db, MongoClient } from "mongodb";

let databasePromise: Promise<Db> | undefined;

export function getDatabase(): Promise<Db> {
  databasePromise ??= connectToDatabase();

  return databasePromise;
}

async function connectToDatabase(): Promise<Db> {
  const connectionString = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DATABASE;

  if (!connectionString) {
    throw new Error("MONGODB_URI must be set");
  }

  if (!databaseName) {
    throw new Error("MONGODB_DATABASE must be set");
  }

  const client = new MongoClient(connectionString);

  await client.connect();

  return client.db(databaseName);
}
