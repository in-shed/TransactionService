import { useState } from 'react';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import './styles/global.css';

export default function App() {
  const [selectedPNo, setSelectedPNo] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshCustomers = () => setReloadKey(k => k + 1);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Bank Application</h1>
        </div>
        <CustomerList
          selectedPNo={selectedPNo}
          onSelect={setSelectedPNo}
          reloadKey={reloadKey}
        />
      </aside>
      <main className="main-content">
        {selectedPNo ? (
          <CustomerDetail
            pNo={selectedPNo}
            onCustomerDeleted={() => {
              setSelectedPNo(null);
              refreshCustomers();
            }}
            onChanged={refreshCustomers}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h2>Welcome</h2>
            <p>Select a customer from the sidebar or create a new one to manage accounts.</p>
          </div>
        )}
      </main>
    </div>
  );
}