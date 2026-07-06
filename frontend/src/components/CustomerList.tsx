import { useCallback, useEffect, useState } from 'react';
import { customersApi } from '../api/customers';
import { ApiError } from '../api/client';
import type { CustomerSummary } from '../types';
import { CustomerForm } from './CustomerForm';

/**
 * Komponent som visar en lista över kunder och hanterar skapandet av nya kunder.
 * @param selectedPNo - Personnummer för den valda kunden.
 * @param onSelect - Callback som anropas när en kund väljs.
 * @param reloadKey - Nyckel som används för att trigga omladdning av kundlistan.
 */
interface CustomerListProps {
  selectedPNo: string | null;
  onSelect: (pNo: string) => void;
  reloadKey: number;
}

/**
 * CustomerList-komponenten renderar en lista över kunder och hanterar skapandet av nya kunder.
 * @param param0 
 * @returns JSX.Element
 */
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
      const err = e as ApiError;
      if (err.status === 503 || err.status === 500) {
        setError("Database error. Please try again later.");
      } else if (err.status === 429) {
        setError("Too many requests. Please slow down.");
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load customers');
      }
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers, reloadKey]);

  const handleCreate = async (firstName: string, lastName: string, pNo: string) => {
    // Use the customer data returned from the API to update the list instantly
    const newCustomer = await customersApi.create({ firstName, lastName, pNo });
    
    setCustomers(prev => {
      const updated = [...prev, { 
        pNo: newCustomer.pNo, 
        firstName: newCustomer.firstName, 
        lastName: newCustomer.lastName 
      }];
      // Maintain alphabetical order
      return updated.sort((a, b) => 
        a.firstName.localeCompare(b.firstName) || 
        a.lastName.localeCompare(b.lastName) || 
        a.pNo.localeCompare(b.pNo)
      );
    });

    setShowForm(false);
    onSelect(pNo);
  };

  return (
    <div className="customer-list">
      <div className="list-header">
        <h2>Customers</h2>
        {!error && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            + Add
          </button>
        )}
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