import { Request, Response } from 'express';
import { BankService } from '../services/BankService.js';

const bankService = new BankService();

/**
 * AccountController hanterar HTTP-förfrågningar relaterade till bankkonton.
 * Den använder BankService för att utföra operationer som att skapa konton, göra insättningar och uttag, samt stänga konton.
 */
export class AccountController {
  static async get(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const account = await bankService.getAccount(pNo, Number(accountId));
    res.json(account);
  }

  /**
   * Skapar ett nytt sparkonto för en kund baserat på personnummer (pNo).
   * @param req express.Request - HTTP-förfrågan som innehåller personnummer i URL-parametrarna.
   * @param res express.Response - HTTP-svaret som skickas tillbaka till klienten.
   */
  static async createSavings(req: Request, res: Response) {
    const { pNo } = req.params;
    const account = await bankService.createSavingsAccount(pNo);
    res.status(201).json(account);
  }

  /**
   * Skapar ett nytt kreditkonto för en kund baserat på personnummer (pNo).
   */
  static async createCredit(req: Request, res: Response) {
    const { pNo } = req.params;
    const account = await bankService.createCreditAccount(pNo);
    res.status(201).json(account);
  }

  /**
   * Gör en insättning på ett konto baserat på personnummer (pNo) och kontonummer (accountId).
   * @returns JSON-objekt som representerar det uppdaterade kontot efter insättningen.
   */
  static async deposit(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }
    const account = await bankService.deposit(pNo, Number(accountId), amount);
    res.json(account);
  }

  /**
   * Gör en uttagsoperation på ett konto baserat på personnummer (pNo) och kontonummer (accountId).
   * Validerar att beloppet är positivt innan uttaget genomförs.
   * @returns JSON-objekt som representerar det uppdaterade kontot efter uttaget.
   */
  static async withdraw(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }
    const account = await bankService.withdraw(pNo, Number(accountId), amount);
    res.json(account);
  }

  /**
   * Stänger ett konto baserat på personnummer (pNo) och kontonummer (accountId).
   */
  static async close(req: Request, res: Response) {
    const { pNo, accountId } = req.params;
    const result = await bankService.closeAccount(pNo, Number(accountId));
    res.json(result);
  }
}