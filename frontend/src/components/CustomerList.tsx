import { useCallback, useEffect, useState } from 'react';
import { customersApi } from '../api/customers';
import type { CustomerSummary } from '../types';
import { CustomerForm } from './CustomerForm';

interface CustomerListProps {
  selectedPNo: string | null;
  onSelect: (pNo: string) => void;
  reloadKey: number;
}

export function CustomerList({ selectedPNo, onSelect, reloadKey }: CustomerListProps) {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(await customersApi.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers, reloadKey]);

  const handleCreate = async (firstName: string, lastName: string, pNo: string) => {
    await customersApi.create({ firstName, lastName, pNo });
    await loadCustomers();
    setShowForm(false);
    onSelect(pNo);
  };

  return (
    <div className="customer-list">
      <div className="list-header">
        <h2>Customers</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          + Add
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="list-items">
        {loading && <p className="muted">Loading…</p>}
        {!loading && customers.length === 0 && !error && (
          <p className="muted">No customers found.</p>
        )}
        {customers.map((c) => (
          <div
            key={c.pNo}
            className={`customer-item ${selectedPNo === c.pNo ? 'active' : ''}`}
            onClick={() => onSelect(c.pNo)}
          >
            <span className="customer-name">{c.firstName} {c.lastName}</span>
            <span className="customer-pno">{c.pNo}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <CustomerForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
}