import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Konfigurera miljövariabler från .env-filen och anslut till databasen med en connection pool.
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/TransactionManagement';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export type { PoolClient };