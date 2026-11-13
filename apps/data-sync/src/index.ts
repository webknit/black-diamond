import { closeDatabase } from "@black-diamond/database/mongodb";
import { runSelectedSync } from "./runSelectedSync";

try {
  await runSelectedSync(process.argv[2]);
} finally {
  await closeDatabase();
}
