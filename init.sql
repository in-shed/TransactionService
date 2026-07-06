-- enum types
CREATE TYPE account_type AS ENUM ('SAVINGS', 'CREDIT');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'ACCOUNT_CLOSED');

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

CREATE INDEX idx_accounts_pno            ON accounts(pno);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);