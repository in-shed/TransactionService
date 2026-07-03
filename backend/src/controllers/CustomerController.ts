import { Request, Response } from 'express';
import { BankService } from '../services/BankService.js';

const bankService = new BankService();

export class CustomerController {
  static async getAll(req: Request, res: Response) {
    const customers = await bankService.getAllCustomers();
    res.json(customers);
  }

  static async get(req: Request, res: Response) {
    const { pNo } = req.params;
    const customer = await bankService.getCustomer(pNo);
    res.json(customer);
  }

  static async create(req: Request, res: Response) {
    const { firstName, lastName, pNo } = req.body;
    if (!firstName || !lastName || !pNo) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const customer = await bankService.createCustomer(firstName, lastName, pNo);
    res.status(201).json(customer);
  }

  static async updateName(req: Request, res: Response) {
    const { pNo } = req.params;
    const { firstName, lastName } = req.body;
    const customer = await bankService.changeCustomerName(firstName || '', lastName || '', pNo);
    res.json(customer);
  }

  static async delete(req: Request, res: Response) {
    const { pNo } = req.params;
    const customer = await bankService.deleteCustomer(pNo);
    res.json(customer);
  }
}