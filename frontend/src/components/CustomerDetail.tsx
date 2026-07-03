import { useCallback, useEffect, useState } from 'react';
import { customersApi } from '../api/customers';
import { accountsApi } from '../api/accounts';
import type { CustomerResponse } from '../types';
import { AccountCard } from './AccountCard';
import { CustomerEditForm } from './CustomerEditForm';
import { ApiError } from '../api/client';

interface CustomerDetailProps {
  pNo: string;
  onCustomerDeleted: () => void;
  onChanged: () => void;
}

export function CustomerDetail({ pNo, onCustomerDeleted, onChanged }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCustomer(await customersApi.get(pNo));
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 503 || err.status === 500) {
        setError("Database is currently unavailable. Please try again later.");
      } else if (err.status === 429) {
        setError("Too many requests. Please slow down.");
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load customer');
      }
    } finally {
      setLoading(false);
    }
  }, [pNo]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateSavings = async () => {
    try {
      await accountsApi.createSavings(pNo);
      await load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create savings account');
    }
  };

  const handleCreateCredit = async () => {
    try {
      await accountsApi.createCredit(pNo);
      await load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create credit account');
    }
  };

  const handleDelete = async () => {
    try {
      await customersApi.delete(pNo);
      onCustomerDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete customer');
      setConfirmDelete(false);
    }
  };

  if (loading && !customer) return <div className="loading-state">Loading customer data…</div>;
  if (error && !customer) return <div className="alert alert-error">{error}</div>;
  if (!customer) return null;

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div>
          <h2>{customer.firstName} {customer.lastName}</h2>
          <p className="muted">ID: {customer.pNo}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete</button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{marginBottom: '1rem'}}>{error}</div>}

      <div className="accounts-section">
        <div className="section-header">
          <h3>Accounts</h3>
          <div className="account-actions-group">
            <button className="btn btn-primary btn-sm" onClick={handleCreateSavings}>+ Savings</button>
            <button className="btn btn-primary btn-sm" onClick={handleCreateCredit}>+ Credit</button>
          </div>
        </div>

        {customer.accounts.length === 0 ? (
          <div className="empty-accounts">
            <p>No accounts yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="account-grid">
            {customer.accounts.map((account) => (
              <AccountCard key={account.accountId} pNo={pNo} account={account} onChanged={load} />
            ))}
          </div>
        )}
      </div>

      {showEdit && (
        <CustomerEditForm
          customer={customer}
          onSubmit={async (firstName, lastName) => {
            await customersApi.updateName(pNo, { firstName, lastName });
            await load();
            onChanged(); // Triggers list reload in App.tsx
            setShowEdit(false);
          }}
          onCancel={() => setShowEdit(false)}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Customer</h3>
            <p>Are you sure you want to delete <strong>{customer.firstName} {customer.lastName}</strong>? This will permanently remove all associated accounts and transactions.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}