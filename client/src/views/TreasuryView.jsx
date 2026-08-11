import React, { useState, useEffect } from 'react';
import { Landmark, ArrowRightLeft, Plus, DollarSign, Wallet, Building } from 'lucide-react';

export default function TreasuryView({ selectedBranch }) {
  const [data, setData] = useState({ transactions: [], balances: {} });
  const [formData, setFormData] = useState({
    transactionType: 'Transfer',
    fromAccount: 'Non IDFC',
    toAccount: 'IDFC Main',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    referenceNo: '',
    description: '',
    branchCode: selectedBranch || 'Salem'
  });

  useEffect(() => {
    fetchTreasury();
  }, [selectedBranch]);

  const fetchTreasury = () => {
    fetch('/api/treasury')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    try {
      const res = await fetch('/api/treasury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount) || 0,
          branchCode: selectedBranch || 'Salem'
        })
      });

      if (res.ok) {
        fetchTreasury();
        setFormData({
          transactionType: 'Transfer',
          fromAccount: 'Non IDFC',
          toAccount: 'IDFC Main',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          referenceNo: '',
          description: '',
          branchCode: selectedBranch || 'Salem'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const { transactions = [], balances = {} } = data;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Treasury Account Balances */}
      <div className="metrics-grid-4">
        <div className="metric-card-box">
          <span className="metric-title-label">IDFC Main Joint Account</span>
          <div className="metric-value-amount" style={{ color: 'var(--blue-primary)' }}>
            ₹{(balances.idfcMainBalance || 0).toLocaleString('en-IN')}
          </div>
          <span className="metric-subtitle-text">Shared HQ Joint Account</span>
        </div>

        <div className="metric-card-box">
          <span className="metric-title-label">Non-IDFC Local Bank</span>
          <div className="metric-value-amount" style={{ color: 'var(--emerald-primary)' }}>
            ₹{(balances.nonIdfcBalance || 0).toLocaleString('en-IN')}
          </div>
          <span className="metric-subtitle-text">Franchisee Local Bank</span>
        </div>

        <div className="metric-card-box">
          <span className="metric-title-label">Counter Cash Pool</span>
          <div className="metric-value-amount" style={{ color: 'var(--amber-primary)' }}>
            ₹{(balances.cashBalance || 0).toLocaleString('en-IN')}
          </div>
          <span className="metric-subtitle-text">Partner In-Hand Cash</span>
        </div>

        <div className="metric-card-box">
          <span className="metric-title-label">Total Liquid Treasury</span>
          <div className="metric-value-amount" style={{ color: '#fff' }}>
            ₹{((balances.idfcMainBalance || 0) + (balances.nonIdfcBalance || 0) + (balances.cashBalance || 0)).toLocaleString('en-IN')}
          </div>
          <span className="metric-subtitle-text">Total Available Cash & Bank</span>
        </div>
      </div>

      <div className="dashboard-grid-2">
        
        {/* Transfer Form */}
        <div className="dashboard-panel-card">
          <div className="panel-title-bar">
            <h3 className="panel-heading">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              Account Transfer & Cash Deposit Log
            </h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select
                value={formData.transactionType}
                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
              >
                <option value="Transfer">Account Transfer</option>
                <option value="Deposit">Bank Deposit</option>
                <option value="Withdrawal">Cash Withdrawal</option>
              </select>

              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>From Account</label>
                <select
                  value={formData.fromAccount}
                  onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                >
                  <option value="Non IDFC">Non IDFC (Local Bank)</option>
                  <option value="Cash">Cash (Counter Cash)</option>
                  <option value="IDFC Main">IDFC Main (HQ Joint)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>To Account</label>
                <select
                  value={formData.toAccount}
                  onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                >
                  <option value="IDFC Main">IDFC Main (HQ Joint)</option>
                  <option value="Non IDFC">Non IDFC (Local Bank)</option>
                  <option value="Cash">Cash (Counter Cash)</option>
                  <option value="HQ">HQ Coimbatore Account</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="number"
                required
                placeholder="Transfer Amount (₹) *"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--emerald-primary)', fontWeight: 'bold', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />

              <input
                type="text"
                placeholder="Ref / UTR No."
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
              />
            </div>

            <button type="submit" className="btn-primary-green" style={{ marginTop: '6px' }}>
              <Plus className="w-4 h-4" />
              <span>Record Treasury Transfer</span>
            </button>
          </form>
        </div>

        {/* Transfer Log */}
        <div className="portal-table-container">
          <table className="portal-data-table">
            <thead>
              <tr>
                <th>Date & Ref</th>
                <th>Type</th>
                <th>From → To</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id || tx._id}>
                  <td>
                    <strong style={{ color: '#fff', display: 'block', fontFamily: 'var(--font-mono)' }}>{tx.date}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>{tx.referenceNo || 'N/A'}</span>
                  </td>
                  <td><span className="sidebar-badge badge-cyan">{tx.transactionType}</span></td>
                  <td style={{ fontSize: '12px' }}>
                    <span style={{ color: 'var(--rose-primary)' }}>{tx.fromAccount}</span> → <span style={{ color: 'var(--emerald-primary)' }}>{tx.toAccount}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: '#fff' }}>
                    ₹{tx.amount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
