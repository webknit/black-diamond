import { Db, MongoClient } from "mongodb";

let databasePromise: Promise<Db> | undefined;
let databaseConfiguration: { connectionString: string; databaseName: string } | undefined;

export function configureDatabase(configuration: {
  connectionString: string;
  databaseName: string;
}): void {
  if (
    databaseConfiguration?.connectionString === configuration.connectionString &&
    databaseConfiguration.databaseName === configuration.databaseName
  ) {
    return;
  }

  if (databasePromise) {
    throw new Error("Database is already connected and cannot be reconfigured");
  }

  databaseConfiguration = configuration;
}

export function getDatabase(): Promise<Db> {
  databasePromise ??= connectToDatabase().catch((error: unknown) => {
    databasePromise = undefined;
    throw error;
  });

  return databasePromise;
}

async function connectToDatabase(): Promise<Db> {
  const connectionString = databaseConfiguration?.connectionString ?? process.env.MONGODB_URI;
  const databaseName = databaseConfiguration?.databaseName ?? process.env.MONGODB_DATABASE;

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
