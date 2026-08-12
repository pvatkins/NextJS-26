//frontend/src/lib/sqlite.ts

import Database from "better-sqlite3";
import path from "path";

const dbPath =
  process.env.SQLITE_DATABASE_PATH ||
  path.join(process.cwd(), "data", "carc.db");

const db = new Database(dbPath);

export default db;
