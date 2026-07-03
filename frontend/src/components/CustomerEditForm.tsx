import { useState, type FormEvent } from 'react';
import type { CustomerResponse } from '../types';

interface CustomerEditFormProps {
  customer: CustomerResponse;
  onSubmit: (firstName: string, lastName: string) => Promise<void>;
  onCancel: () => void;
}

export function CustomerEditForm({ customer, onSubmit, onCancel }: CustomerEditFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const hasFirst = firstName.trim().length > 0;
    const hasLast = lastName.trim().length > 0;

    if (!hasFirst && !hasLast) {
      setError('At least one field must be filled out to update.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const payload: { firstName?: string; lastName?: string } = {};
      if (hasFirst) payload.firstName = firstName.trim();
      if (hasLast) payload.lastName = lastName.trim();
      await onSubmit(payload.firstName ?? '', payload.lastName ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Change Name</h3>
        <p className="muted" style={{marginBottom: '1rem'}}>Leave blank to keep current value.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name (Current: {customer.firstName})</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} placeholder={customer.firstName} />
          </div>
          <div className="form-group">
            <label>Last Name (Current: {customer.lastName})</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} placeholder={customer.lastName} />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}