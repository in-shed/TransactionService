import { useState } from 'react';
import { accountsApi } from '../api/accounts';
import { transactionsApi } from '../api/transactions';
import type { AccountResponse, TransactionResponse } from '../types';
import { ApiError } from '../api/client';

interface AccountCardProps {
  pNo: string;
  account: AccountResponse;
  onChanged: () => void;
}

export function AccountCard({ pNo, account, onChanged}: AccountCardProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[] | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const validateAmount = (): number | null => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
      setError('Amount must be a positive whole number');
      return null;
    }
    return value;
  };

  const handleDeposit = async () => {
    const value = validateAmount();
    if (value === null) return;
    try {
      await accountsApi.deposit(pNo, account.accountId, { amount: value });
      setAmount('');
      setError(null);
      onChanged();
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 503 || err.status === 500) {
        setError("Database error. Please try again later.");
      } else if (err.status === 429) {
        setError("Too many requests. Please slow down.");
      } else {
        setError(err.message || 'Deposit failed');
      }
    }
  };

  const handleWithdraw = async () => {
    const value = validateAmount();
    if (value === null) return;
    try {
      await accountsApi.withdraw(pNo, account.accountId, { amount: value });
      setAmount('');
      setError(null);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Withdrawal failed');
    }
  };

  const handleToggleTransactions = async () => {
    if (transactions !== null) {
      setTransactions(null);
      return;
    }
    try {
      setTransactions(await transactionsApi.getAll(pNo, account.accountId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transactions');
    }
  };

  const handleClose = async () => {
    try {
      await accountsApi.close(pNo, account.accountId);
      setConfirmClose(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to close account');
      setConfirmClose(false);
    }
  };

  const balance = parseFloat(account.balance);
  const isNegative = balance < 0;

  return (
    <div className="account-card">
      <div className="card-header">
        <div className="account-info">
          <span className={`badge ${account.accountType.toLowerCase()}`}>{account.accountType}</span>
          <span className="account-id">#{account.accountId}</span>
        </div>
      </div>

      <div className="balance-display">
        <span className="balance-label">Available Balance</span>
        <span className={`balance-amount ${isNegative ? 'negative' : ''}`}>{account.balance} kr</span>
      </div>

      <div className="action-bar">
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="amount-input"
        />
        <button className="btn btn-sm btn-primary" onClick={handleDeposit}>Deposit</button>
        <button className="btn btn-sm btn-primary" onClick={handleWithdraw}>Withdraw</button>
      </div>

      <div className="card-footer">
        <button className="btn-link" onClick={handleToggleTransactions}>
          {transactions !== null ? 'Hide Transactions' : 'View Transactions'}
        </button>
        <button className="btn-link danger" onClick={() => setConfirmClose(true)}>Close Account</button>
      </div>

      {error && <div className="alert alert-error" style={{marginTop: '1rem'}}>{error}</div>}

      {transactions !== null && (
        <div className="transactions-table">
          <h4>Transaction History</h4>
          {transactions.length === 0 ? (
            <p className="muted">No transactions yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.transactionId}>
                    <td>{new Date(t.transactionTime).toLocaleDateString()}</td>
                    <td>{t.transactionType}</td>
                    <td className={parseFloat(t.amount) < 0 ? 'negative' : 'positive'}>{t.amount} kr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {confirmClose && (
        <div className="modal-overlay" onClick={() => setConfirmClose(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Close Account #{account.accountId}</h3>
            <p>Are you sure you want to close this {account.accountType.toLowerCase()} account?
              {account.accountType === 'SAVINGS' && parseFloat(account.balance) > 0 && ' 1% interest will be applied to the remaining balance.'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmClose(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleClose}>Close Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}