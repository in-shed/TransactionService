# Transaction Management 

A full-stack banking application built with a Node.js/Express.js/TypeScript backend and a React/TypeScript frontend. It allows for management of customers, accounts (Savings and Credit), and financial transactions between them with decimal handling.

## Features

- Management of Customers: Create, view, update names, and delete customers. Deleting a customer cascades to all their accounts and transactions.
- Management of Accounts: Create Savings and Credit accounts. Close accounts with automatic 1% interest calculation for positive savings balances.
- Management of Transactions: Deposit and withdraw funds. View the full transaction history per account. Withdrawals on savings accounts are blocked if there are insufficient funds, while credit accounts can go negative.
- Uses Decimal.js on the backend and strict numeric(15,2) database columns to prevent floating-point rounding errors.
- Security & Reliability:
        Sets secure HTTP headers using helmet.
        Prevents abuse using rate limiting (handles 429 Too Many Requests).
         Resilient database: Handles database disconnects without crashing the Node process.
        Validation on both client and server to prevent invalid inputs.

## Tech Stack

     Backend: Node.js, Express, TypeScript
     Database: PostgreSQL (using native pg driver)
     Frontend: React, Vite, TypeScript
     Libraries: decimal.js (precision math), helmet, express-rate-limit, cors

## Database Schema

The application expects a PostgreSQL database with native enum types.

sql

-- Custom Enum Types
CREATE TYPE account_type AS ENUM ('SAVINGS', 'CREDIT');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'ACCOUNT_CLOSED');

-- Tables
CREATE TABLE customers (
    pno         VARCHAR(20)   PRIMARY KEY,
    first_name  VARCHAR(100)  NOT NULL,
    last_name   VARCHAR(100)  NOT NULL
);

CREATE TABLE accounts (
    account_id    SERIAL        PRIMARY KEY,
    pno           VARCHAR(20)   NOT NULL REFERENCES customers(pno) ON DELETE CASCADE,
    account_type  account_type  NOT NULL,
    balance       NUMERIC(15,2) NOT NULL DEFAULT 0
);

CREATE TABLE transactions (
    transaction_id    SERIAL            PRIMARY KEY,
    account_id        INTEGER           NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    amount            NUMERIC(15,2)     NOT NULL,
    transaction_type  transaction_type  NOT NULL,
    description       VARCHAR(255),
    transaction_time  TIMESTAMP         NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_accounts_pno            ON accounts(pno);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/customers` | List all customers |
| `POST` | `/api/customers` | Create customer |
| `GET` | `/api/customers/{pNo}` | Get customer + accounts |
| `PATCH` | `/api/customers/{pNo}` | Change name |
| `DELETE` | `/api/customers/{pNo}` | Delete customer (cascade) |
| `POST` | `/api/customers/{pNo}/accounts/savings` | Create savings account |
| `POST` | `/api/customers/{pNo}/accounts/credit` | Create credit account |
| `GET` | `/api/customers/{pNo}/accounts/{accountId}` | Get account info |
| `POST` | `/api/customers/{pNo}/accounts/{accountId}/deposit` | Deposit |
| `POST` | `/api/customers/{pNo}/accounts/{accountId}/withdraw` | Withdraw |
| `DELETE` | `/api/customers/{pNo}/accounts/{accountId}` | Close account |
| `GET` | `/api/customers/{pNo}/accounts/{accountId}/transactions` | Transaction history |