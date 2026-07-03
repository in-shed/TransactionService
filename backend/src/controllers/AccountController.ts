import { Request, Response } from 'express';
import { BankService } from '../services/BankService.js';

const bankService = new BankService();

export class AccountController {
  static async get(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const account = await bankService.getAccount(pNo, Number(accountId));
    res.json(account);
  }

  static async createSavings(req: Request, res: Response) {
    const { pNo } = req.params;
    const account = await bankService.createSavingsAccount(pNo);
    res.status(201).json(account);
  }

  static async createCredit(req: Request, res: Response) {
    const { pNo } = req.params;
    const account = await bankService.createCreditAccount(pNo);
    res.status(201).json(account);
  }

  static async deposit(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }
    const account = await bankService.deposit(pNo, Number(accountId), amount);
    res.json(account);
  }

  static async withdraw(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }
    const account = await bankService.withdraw(pNo, Number(accountId), amount);
    res.json(account);
  }

  static async close(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const result = await bankService.closeAccount(pNo, Number(accountId));
    res.json(result);
  }
}