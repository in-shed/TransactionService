import { pool, PoolClient } from '../config/db.js';

export interface Customer {
  pno: string;
  first_name: string;
  last_name: string;
}

export class CustomerRepository {
  async findAll(): Promise<Customer[]> {
    const res = await pool.query('SELECT * FROM customers ORDER BY first_name, last_name, pno');
    return res.rows;
  }

  async findByPNo(pNo: string): Promise<Customer | null> {
    const res = await pool.query('SELECT * FROM customers WHERE pno = $1', [pNo]);
    return res.rows[0] || null;
  }

  async exists(pNo: string, client?: PoolClient): Promise<boolean> {
    const res = await (client || pool).query('SELECT 1 FROM customers WHERE pno = $1', [pNo]);
    return (res.rowCount ?? 0) > 0;
  }

  async save(customer: Customer, client?: PoolClient): Promise<boolean> {
    const res = await (client || pool).query(
      'INSERT INTO customers(pno, first_name, last_name) VALUES ($1, $2, $3) RETURNING pno',
      [customer.pno, customer.first_name, customer.last_name]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async updateName(pNo: string, firstName: string, lastName: string, client?: PoolClient): Promise<boolean> {
    const res = await (client || pool).query(
      'UPDATE customers SET first_name = $1, last_name = $2 WHERE pno = $3',
      [firstName, lastName, pNo]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async delete(pNo: string, client?: PoolClient): Promise<boolean> {
    const res = await (client || pool).query('DELETE FROM customers WHERE pno = $1', [pNo]);
    return (res.rowCount ?? 0) > 0;
  }
}