const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             parseInt(process.env.DB_PORT) || 3306,
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'it_crms',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  enableKeepAlive:    true,
  keepAliveInitialDelay: 10000,
});

pool.on('error', err => {
  console.error('✗  MySQL pool error:', err.message);
});

const testConnection = async (retries = 3, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log(`✓  MySQL connected  →  ${process.env.DB_NAME}`);
      conn.release();
      return;
    } catch (err) {
      console.error(`✗  MySQL connection attempt ${i + 1}/${retries} failed: ${err.message}`);
      if (i < retries - 1) {
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  console.error('✗  Could not connect to MySQL after multiple attempts.');
  process.exit(1);
};

const waitForConnection = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return false;
};

module.exports = { pool, testConnection, waitForConnection };
