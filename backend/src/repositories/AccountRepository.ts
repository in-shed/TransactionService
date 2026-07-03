import { pool, PoolClient } from '../config/db.js';
import { AccountType } from '../enums/index.js';

export interface AccountRecord {
  account_id: number;
  pno: string;
  account_type: AccountType;
  balance: string; // pg returns numeric as string by default
}

export class AccountRepository {
  async findByPNo(pNo: string, client?: PoolClient): Promise<AccountRecord[]> {
    const res = await (client || pool).query(
      'SELECT * FROM accounts WHERE pno = $1 ORDER BY account_id', 
      [pNo]
    );
    return res.rows;
  }

  async findById(accountId: number, client?: PoolClient): Promise<AccountRecord | null> {
    const res = await (client || pool).query(
      'SELECT * FROM accounts WHERE account_id = $1', 
      [accountId]
    );
    return res.rows[0] || null;
  }

  async save(pNo: string, accountType: AccountType, balance: string, client?: PoolClient): Promise<number> {
    const res = await (client || pool).query(
      'INSERT INTO accounts(pno, account_type, balance) VALUES ($1, $2::account_type, $3) RETURNING account_id',
      [pNo, accountType, balance]
    );
    return res.rows[0].account_id;
  }

  async updateBalance(accountId: number, balance: string, client?: PoolClient): Promise<boolean> {
    const res = await (client || pool).query(
      'UPDATE accounts SET balance = $1 WHERE account_id = $2',
      [balance, accountId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async delete(accountId: number, client?: PoolClient): Promise<boolean> {
    const res = await (client || pool).query(
      'DELETE FROM accounts WHERE account_id = $1',
      [accountId]
    );
    return (res.rowCount ?? 0) > 0;
  }
}