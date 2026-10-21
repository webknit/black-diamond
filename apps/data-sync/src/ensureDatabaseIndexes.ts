import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";

await ensureDatabaseIndexes();

console.log("Database indexes are ready.");
