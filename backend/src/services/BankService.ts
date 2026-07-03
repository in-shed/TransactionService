import { PoolClient } from 'pg';
import { pool } from '../config/db.js';
import { CustomerRepository } from '../repositories/CustomerRepository.js';
import { AccountRepository } from '../repositories/AccountRepository.js';
import { TransactionRepository } from '../repositories/TransactionRepository.js';
import { AccountType, TransactionType } from '../enums/index.js';
import { ResourceNotFoundError, BusinessError } from '../errors/index.js';
import Decimal from 'decimal.js';

/**
 * Klass som innefattar bankens logik.
 */
export class BankService {
  private customerRepo = new CustomerRepository();
  private accountRepo = new AccountRepository();
  private transactionRepo = new TransactionRepository();

  /**
   * Hämtar info om alla kunder.
   *
   * @returns customerInfo lista med info om alla kunder.
   */
  async getAllCustomers() {
    const customers = await this.customerRepo.findAll();
    return customers.map(c => ({
      pNo: c.pno,
      firstName: c.first_name,
      lastName: c.last_name
    }));
  }

  /**
   * Skapar en ny kund.
   *
   * @param name kundens förnamn
   * @param surname kundens efternamn
   * @param pNo kundens personnummer
   * @returns true om kunden skapades, annars false. Kunder kan inte skapas med samma personnummer.
   */
  async createCustomer(firstName: string, lastName: string, pNo: string) {
    if (await this.customerRepo.exists(pNo)) {
      throw new BusinessError(`Customer with pNo ${pNo} already exists`);
    }

    const customer = { pno: pNo, first_name: firstName, last_name: lastName };
    await this.customerRepo.save(customer);

    return {
      pNo,
      firstName,
      lastName,
      accounts: []
    };
  }

  /**
   * Hämtar en kund baserat på personnummer.
   *
   * @param pNo kundens personnummer
   * @return customerInfo lista med info om kunden och dess konton, null om kunden inte finns.
   */
  async getCustomer(pNo: string) {
    const customer = await this.customerRepo.findByPNo(pNo);
    if (!customer) {
      throw new ResourceNotFoundError(`Customer not found: ${pNo}`);
    }

    const accounts = await this.accountRepo.findByPNo(pNo);

    return {
      pNo: customer.pno,
      firstName: customer.first_name,
      lastName: customer.last_name,
      accounts: accounts.map(a => ({
        accountId: a.account_id,
        pNo: a.pno,
        accountType: a.account_type,
        balance: a.balance // kept as string for precision
      }))
    };
  }

  /**
   * Ändrar en kunds namn.
   *
   * @param name kundens nya förnamn
   * @param surname kundens nya efternamn
   * @param pNo kundens personnummer
   * @return true om antingen förnamn eller efternamn ändrades, annars false.
   */
  async changeCustomerName(firstName: string, lastName: string, pNo: string) {
    const customer = await this.customerRepo.findByPNo(pNo);
    if (!customer) {
      throw new ResourceNotFoundError(`Customer not found: ${pNo}`);
    }

    const hasFirst = firstName && firstName.trim().length > 0;
    const hasLast = lastName && lastName.trim().length > 0;

    if (!hasFirst && !hasLast) {
      throw new BusinessError("At least one of firstName or lastName must be provided");
    }

    const newFirst = hasFirst ? firstName : customer.first_name;
    const newLast = hasLast ? lastName : customer.last_name;

    await this.customerRepo.updateName(pNo, newFirst, newLast);
    
    const accounts = await this.accountRepo.findByPNo(pNo);
    return {
      pNo: customer.pno,
      firstName: newFirst,
      lastName: newLast,
      accounts: accounts.map(a => ({
        accountId: a.account_id,
        pNo: a.pno,
        accountType: a.account_type,
        balance: a.balance
      }))
    };
  }

  /**
   * Tar bort en kund och dess konton.
   *
   * @param pNo kundens personnummer
   * @return customerInfo lista med info om kunden och dess konton, null om kunden inte finns.
   */
  async deleteCustomer(pNo: string) {
    const customer = await this.customerRepo.findByPNo(pNo);
    if (!customer) {
      throw new ResourceNotFoundError(`Customer not found: ${pNo}`);
    }

    const accounts = await this.accountRepo.findByPNo(pNo);
    const snapshot = {
      pNo: customer.pno,
      firstName: customer.first_name,
      lastName: customer.last_name,
      accounts: accounts.map(a => ({
        accountId: a.account_id,
        pNo: a.pno,
        accountType: a.account_type,
        balance: a.balance
      }))
    };

    // cascade handles the rest
    await this.customerRepo.delete(pNo); 
    return snapshot;
  }

  /**
   * Skapar ett sparkonto åt en kund.
   *
   * @param pNo kundens personnummer
   * @return accountId det nya kontots id, -1 om kunden inte finns.
   */
  async createSavingsAccount(pNo: string) {
    const customer = await this.customerRepo.findByPNo(pNo);
    if (!customer) {
      throw new ResourceNotFoundError(`Customer not found: ${pNo}`);
    }
    
    const accountId = await this.accountRepo.save(pNo, AccountType.SAVINGS, 0);
    const account = await this.accountRepo.findById(accountId);
    
    return {
      accountId: account!.account_id,
      pNo: account!.pno,
      accountType: account!.account_type,
      balance: account!.balance
    };
  }

  /**
   * Skapar ett kreditkonto åt en kund.
   *
   * @param pNo kundens personnummer
   * @return accountId det nya kontots id, -1 om kunden inte finns.
   */
  async createCreditAccount(pNo: string) {
    const customer = await this.customerRepo.findByPNo(pNo);
    if (!customer) {
      throw new ResourceNotFoundError(`Customer not found: ${pNo}`);
    }
    
    const accountId = await this.accountRepo.save(pNo, AccountType.CREDIT, 0);
    const account = await this.accountRepo.findById(accountId);
    
    return {
      accountId: account!.account_id,
      pNo: account!.pno,
      accountType: account!.account_type,
      balance: account!.balance
    };
  }

  /**
   * Hämtar ett kontos info.
   *
   * @param pNo kundens personnummer
   * @param accountId kontots id
   * @return account kontots info, null om kunden eller kontot inte finns.
   */
  async getAccount(pNo: string, accountId: number) {
    const acc = await this.getOwnedAccount(pNo, accountId);
    if (!acc) return null;

    return {
      accountId: acc.account_id,
      pNo: acc.pno,
      accountType: acc.account_type,
      balance: acc.balance
    };
  }

  /**
   * Sätter in pengar på ett konto.
   *
   * @param pNo kundens personnummer
   * @param accountId kontots id
   * @param amount belopp att sätta in
   * @return true om insättningen lyckades, annars false.
   */
  async deposit(pNo: string, accountId: number, amount: number) {
    if (amount <= 0) {
      throw new BusinessError("Deposit amount must be positive");
    }

    const acc = await this.getOwnedAccount(pNo, accountId);
    if (!acc) throw new ResourceNotFoundError("Account not found or does not belong to customer");

    const currentBalance = new Decimal(acc.balance);
    const newBalance = currentBalance.plus(amount);

    await this.executeInTransaction(async (client) => {
      await this.accountRepo.updateBalance(accountId, newBalance.toNumber(), client);
      await this.transactionRepo.save(accountId, amount, TransactionType.DEPOSIT, "Deposit", client);
    });

    return {
      accountId: acc.account_id,
      pNo: acc.pno,
      accountType: acc.account_type,
      balance: newBalance.toFixed(2)
    };
  }

  /**
   * Tar ut pengar från ett konto.
   *
   * @param pNo kundens personnummer
   * @param accountId kontots id
   * @param amount belopp att ta ut
   * @return true om uttaget lyckades, annars false.
   */
  async withdraw(pNo: string, accountId: number, amount: number) {
    if (amount <= 0) {
      throw new BusinessError("Withdrawal amount must be positive");
    }

    const acc = await this.getOwnedAccount(pNo, accountId);
    if (!acc) throw new ResourceNotFoundError("Account not found or does not belong to customer");

    const amountBD = new Decimal(amount);
    const currentBalance = new Decimal(acc.balance);
    const newBalance = currentBalance.minus(amountBD);

    if (AccountType.SAVINGS === acc.account_type && newBalance.lessThan(0)) {
      throw new BusinessError("Insufficient funds on savings account " + accountId);
    }

    await this.executeInTransaction(async (client) => {
      await this.accountRepo.updateBalance(accountId, newBalance.toNumber(), client);
      // Original Java code used amountBD.negate()
      await this.transactionRepo.save(accountId, -amount, TransactionType.WITHDRAWAL, "Withdrawal", client);
    });

    return {
      accountId: acc.account_id,
      pNo: acc.pno,
      accountType: acc.account_type,
      balance: newBalance.toFixed(2)
    };
  }

  /**
   * Stänger ett konto.
   *
   * @param pNo kundens personnummer
   * @param accountId kontots id
   * @return info om kontot vid avslut, null om kunden eller kontot inte finns.
   */
  async closeAccount(pNo: string, accountId: number) {
    const acc = await this.getOwnedAccount(pNo, accountId);
    if (!acc) throw new ResourceNotFoundError("Account not found or does not belong to customer");

    let balance = new Decimal(acc.balance);

    await this.executeInTransaction(async (client) => {
      // Calculate interest on savings (example: 1.0 %)
      if (AccountType.SAVINGS === acc.account_type && balance.greaterThan(0)) {
        const interest = balance.mul('0.01').toDecimalPlaces(2);
        await this.transactionRepo.save(accountId, interest.toNumber(), TransactionType.INTEREST, "Interest on closure", client);
        balance = balance.plus(interest);
      }

      const finalBalance = balance;
      await this.transactionRepo.save(accountId, finalBalance.toNumber(), TransactionType.ACCOUNT_CLOSED, "Account closed", client);
      await this.accountRepo.delete(accountId, client);
    });

    return {
      accountId: acc.account_id,
      accountType: acc.account_type,
      finalBalance: balance.toFixed(2),
      message: `Account ${accountId} (${acc.account_type}) closed. Final balance: ${balance.toFixed(2)}`
    };
  }

  /**
   * Hämtar en förteckning över transaktionerna för ett konto
   *
   * @param pNo kundens personnummer
   * @param accountId kontots id
   * @return arraylist med kontohistoriken, null om kontot inte finns.
   */
  async getTransactions(pNo: string, accountId: number) {
    const acc = await this.getOwnedAccount(pNo, accountId);
    if (!acc) throw new ResourceNotFoundError("Account not found or does not belong to customer");

    const transactions = await this.transactionRepo.findByAccountId(accountId);
    
    return transactions.map(t => ({
      transactionId: t.transaction_id,
      accountId: t.account_id,
      amount: t.amount,
      transactionType: t.transaction_type,
      description: t.description,
      transactionTime: t.transaction_time
    }));
  }

  /**
   * Verifierar att ett konto existerar OCH tillhör den givna kunden.
   */
  private async getOwnedAccount(pNo: string, accountId: number) {
    const acc = await this.accountRepo.findById(accountId);
    if (!acc) {
      return null;
    }
    if (acc.pno !== pNo) {
      console.warn(`Account ${accountId} does not belong to pNo=${pNo}`);
      return null;
    }
    return acc;
  }

  /**
   * Runs a unit of work inside a database transaction with
   * commit / rollback semantics.
   */
  private async executeInTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}