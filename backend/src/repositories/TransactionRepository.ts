import { pool, PoolClient } from '../config/db.js';
import { TransactionType } from '../enums/index.js';

export interface TransactionRecord {
  transaction_id: number;
  account_id: number;
  amount: string;
  transaction_type: string;
  description: string;
  transaction_time: Date;
}

export class TransactionRepository {
  async save(
    accountId: number, 
    amount: string, 
    transactionType: TransactionType, 
    description: string, 
    client?: PoolClient
  ): Promise<number> {
    const queryText = 'INSERT INTO transactions (account_id, amount, transaction_type, description) VALUES ($1, $2, $3::transaction_type, $4) RETURNING transaction_id';
    const res = await (client || pool).query(queryText, [accountId, amount, transactionType, description]);
    return res.rows[0].transaction_id;
  }

  async findByAccountId(accountId: number, client?: PoolClient): Promise<TransactionRecord[]> {
    const res = await (client || pool).query(
      'SELECT * FROM transactions WHERE account_id = $1 ORDER BY transaction_time DESC', 
      [accountId]
    );
    return res.rows;
  }
}