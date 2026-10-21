import { checkDatabaseConnection } from "./database/checkDatabaseConnection.js";

const databaseName = await checkDatabaseConnection();

console.log(`Connected to MongoDB database: ${databaseName}`);
