const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/creatorchain';
const isRemote = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ...(isRemote && { ssl: { rejectUnauthorized: false } }),
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
