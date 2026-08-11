import React, { useState } from 'react';
import { Search, User, FileText, DollarSign, Building, Users } from 'lucide-react';

export default function GlobalSearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ receipts: [], vouchers: [], employees: [], b2b: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Global Search Bar Card */}
      <div className="dashboard-panel-card" style={{ background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(8, 145, 178, 0.3)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 12px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search className="w-5 h-5 text-cyan-400" />
          Unified ERP Global Search Engine
        </h2>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search by Student name, Receipt No, Phone, Voucher, Employee or College..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
          <button type="submit" className="btn-primary-green" style={{ padding: '12px 24px', fontSize: '14px' }}>
            <span>Search ERP</span>
          </button>
        </form>
      </div>

      {/* Results Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Student Receipts Results */}
        {results.receipts?.length > 0 && (
          <div className="dashboard-panel-card">
            <h3 className="panel-heading" style={{ color: 'var(--emerald-primary)', marginBottom: '12px' }}>
              <User className="w-4 h-4" />
              Student Receipts ({results.receipts.length})
            </h3>
            <div className="portal-table-container">
              <table className="portal-data-table">
                <tbody>
                  {results.receipts.map(r => (
                    <tr key={r.id || r._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>{r.receiptNo}</td>
                      <td><strong style={{ color: '#fff' }}>{r.studentName}</strong></td>
                      <td>{r.course}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>₹{r.amountPayingNow?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expense Vouchers Results */}
        {results.vouchers?.length > 0 && (
          <div className="dashboard-panel-card">
            <h3 className="panel-heading" style={{ color: 'var(--rose-primary)', marginBottom: '12px' }}>
              <FileText className="w-4 h-4" />
              Expense Vouchers ({results.vouchers.length})
            </h3>
            <div className="portal-table-container">
              <table className="portal-data-table">
                <tbody>
                  {results.vouchers.map(v => (
                    <tr key={v.id || v._id}>
                      <td><strong style={{ color: '#fff' }}>{v.title}</strong></td>
                      <td>{v.payeeVendor}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--rose-primary)' }}>₹{v.amount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
