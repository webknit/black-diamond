import { closeDatabase } from "@black-diamond/database/mongodb";
import { runSelectedSync } from "./runSelectedSync.js";

try {
  await runSelectedSync(process.argv[2]);
} finally {
  await closeDatabase();
}
