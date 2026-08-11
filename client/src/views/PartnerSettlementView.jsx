import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldCheck, ArrowRightLeft, Sparkles, Plus, CheckCircle2 } from 'lucide-react';

export default function PartnerSettlementView({ selectedBranch }) {
  const [settlements, setSettlements] = useState([]);
  const [formData, setFormData] = useState({
    periodMonth: 'August 2026',
    grossRevenue: '',
    totalExpenses: '',
    partnerSharePercent: 50,
    crossBranchIncentiveAdjustments: '',
    branchCode: selectedBranch || 'Salem'
  });

  useEffect(() => {
    fetchSettlements();
  }, [selectedBranch]);

  const fetchSettlements = () => {
    fetch('/api/partner-settlements')
      .then(res => res.json())
      .then(data => setSettlements(data))
      .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.grossRevenue || !formData.totalExpenses) return;

    try {
      const res = await fetch('/api/partner-settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          branchCode: selectedBranch || 'Salem'
        })
      });

      if (res.ok) {
        fetchSettlements();
        setFormData({
          periodMonth: 'August 2026',
          grossRevenue: '',
          totalExpenses: '',
          partnerSharePercent: 50,
          crossBranchIncentiveAdjustments: '',
          branchCode: selectedBranch || 'Salem'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(15, 23, 42, 0.9))', padding: '20px', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.3)', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            Partner Monthly Settlement Ledger & Cross-Branch Incentives — {selectedBranch}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
            Monthly profit-sharing distribution, HQ management splits, and lead conversion attribution incentives.
          </p>
        </div>
      </div>

      <div className="dashboard-grid-2">
        
        {/* Entry Form */}
        <div className="dashboard-panel-card">
          <div className="panel-title-bar">
            <h3 className="panel-heading">Calculate & Record Monthly Settlement</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              required
              placeholder="Settlement Month (e.g. August 2026) *"
              value={formData.periodMonth}
              onChange={(e) => setFormData({ ...formData, periodMonth: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="number"
                required
                placeholder="Gross Inflow Revenue (₹) *"
                value={formData.grossRevenue}
                onChange={(e) => setFormData({ ...formData, grossRevenue: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--emerald-primary)', fontWeight: 'bold', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />

              <input
                type="number"
                required
                placeholder="Total Expenses (₹) *"
                value={formData.totalExpenses}
                onChange={(e) => setFormData({ ...formData, totalExpenses: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--rose-primary)', fontWeight: 'bold', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Partner Share (%)</label>
                <input
                  type="number"
                  value={formData.partnerSharePercent}
                  onChange={(e) => setFormData({ ...formData, partnerSharePercent: parseFloat(e.target.value) || 50 })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Cross-Branch Incentives (₹)</label>
                <input
                  type="number"
                  placeholder="± Adjustment"
                  value={formData.crossBranchIncentiveAdjustments}
                  onChange={(e) => setFormData({ ...formData, crossBranchIncentiveAdjustments: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--amber-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-green" style={{ marginTop: '6px' }}>
              <Plus className="w-4 h-4" />
              <span>Record Settlement Ledger</span>
            </button>
          </form>
        </div>

        {/* Ledger Table */}
        <div className="portal-table-container">
          <table className="portal-data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Gross Revenue</th>
                <th>Net Profit Pool</th>
                <th style={{ textAlign: 'right' }}>Partner Share</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item) => (
                <tr key={item.id || item._id}>
                  <td>
                    <strong style={{ color: '#fff', display: 'block' }}>{item.periodMonth}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>{item.branchCode}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>₹{item.grossRevenue?.toLocaleString('en-IN')}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)' }}>₹{item.netProfitPool?.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '900', color: 'var(--emerald-primary)' }}>
                    ₹{item.finalSettlementAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center' }}><span className="badge-pill badge-paid">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
