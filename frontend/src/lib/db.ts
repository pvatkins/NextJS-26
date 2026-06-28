// frontend/src/lib/db.ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.MY_SQL_HOST,
  user: process.env.MY_SQL_USER,
  password: process.env.MY_SQL_PASSWORD,
  database: process.env.MY_SQL_DATABASE,
  port: process.env.MY_SQL_PORT ? parseInt(process.env.MY_SQL_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
