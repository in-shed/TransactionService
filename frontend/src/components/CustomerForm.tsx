import { useState, type FormEvent } from 'react';

interface CustomerFormProps {
  onSubmit: (firstName: string, lastName: string, pNo: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * Komponent som visar ett formulär för att skapa en ny kund.
 * @param param0 
 * @returns 
 */
export function CustomerForm({ onSubmit, onCancel }: CustomerFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pNo, setPNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(firstName, lastName, pNo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Customer</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={100} autoFocus />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={100} />
          </div>
          <div className="form-group">
            <label>Personal Number (pNo)</label>
            <input type="text" value={pNo} onChange={(e) => setPNo(e.target.value)} required maxLength={20} placeholder="e.g. 850101-1234" />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}