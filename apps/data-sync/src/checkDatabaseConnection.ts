import { checkDatabaseConnection } from "./database/checkDatabaseConnection";

const databaseName = await checkDatabaseConnection();

console.log(`Connected to MongoDB database: ${databaseName}`);
