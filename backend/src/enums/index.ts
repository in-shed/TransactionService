/**
 * AccountType enum representerar de olika typerna av bankkonton som stöds i systemet.
 */
export enum AccountType {
  SAVINGS = 'SAVINGS',
  CREDIT = 'CREDIT'
}

/**
 * TransactionType enum representerar de olika typerna av transaktioner som kan utföras på ett bankkonto.
 */
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  INTEREST = 'INTEREST',
  ACCOUNT_CLOSED = 'ACCOUNT_CLOSED'
}