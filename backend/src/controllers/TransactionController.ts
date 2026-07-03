import { Request, Response } from 'express';
import { BankService } from '../services/BankService.js';

const bankService = new BankService();

export class TransactionController {
  static async getAll(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const transactions = await bankService.getTransactions(pNo, Number(accountId));
    res.json(transactions);
  }
}