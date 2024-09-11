import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DRIVER_NAME,
});

export async function query(sql: string, values?: any) {
  const [results] = await pool.execute(sql, values);
  return results;
}