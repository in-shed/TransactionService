export type AccountType = 'SAVINGS' | 'CREDIT';

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'INTEREST'
  | 'ACCOUNT_CLOSED';

export interface CustomerSummary {
  pNo: string;
  firstName: string;
  lastName: string;
}

export interface AccountResponse {
  accountId: number;
  pNo: string;
  accountType: AccountType;
  balance: string;
}

export interface CustomerResponse {
  pNo: string;
  firstName: string;
  lastName: string;
  accounts: AccountResponse[];
}

export interface TransactionResponse {
  transactionId: number;
  accountId: number;
  amount: string;
  transactionType: TransactionType;
  description: string;
  transactionTime: string;
}

export interface AccountCloseResponse {
  accountId: number;
  accountType: AccountType;
  finalBalance: string;
  message: string;
}

export interface CustomerCreateRequest {
  firstName: string;
  lastName: string;
  pNo: string;
}

export interface CustomerUpdateRequest {
  firstName?: string;
  lastName?: string;
}

export interface AmountRequest {
  amount: number;
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  fieldErrors?: Record<string, string>;
}