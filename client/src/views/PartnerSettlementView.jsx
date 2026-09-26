import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldCheck, ArrowRightLeft, Sparkles, Plus, CheckCircle2, Handshake, Award, Building2, Users } from 'lucide-react';

const AGREEMENTS_INFO = [
  {
    id: 'agreement-1',
    title: 'Agreement 1: Maharashtra Exclusive Territory',
    subtitle: 'Career Vidyalaya & Nilanjan Only',
    detail: 'Giving entire MH territory exclusively to Career Vidyalaya (25%) and Nilanjan (25%) with Thoughtflows HQ (50%). No other outside franchise partners.',
    partnerShare: 50,
  },
  {
    id: 'agreement-2',
    title: 'Agreement 2: Pune Location Equity Share',
    subtitle: 'TF 50% · Career Vidyalaya 25% · Nilanjan 25%',
    detail: 'Thoughtflows (TF): 50% | Career Vidyalaya: 25% | Nilanjan: 25%.',
    partnerShare: 50,
  },
  {
    id: 'agreement-3',
    title: 'Agreement 3: Kolhapur Location Equity Share',
    subtitle: 'Genesis 50% · TF 25% · Career Vidyalaya 20% · Nilanjan 5%',
    detail: 'Genesis College: 50% | Thoughtflows (TF): 25% | Career Vidyalaya: 20% | Nilanjan: 5%.',
    partnerShare: 75,
  },
];

export default function PartnerSettlementView({ selectedBranch }) {
  const currentBranch = selectedBranch || 'Pune (FC Road) ★';
  const isKolhapur = currentBranch.toLowerCase().includes('kolhapur');
  const defaultShare = isKolhapur ? 75 : 50;

  const [settlements, setSettlements] = useState([]);
  const [formData, setFormData] = useState({
    periodMonth: 'September 2026',
    grossRevenue: '',
    totalExpenses: '',
    partnerSharePercent: defaultShare,
    crossBranchIncentiveAdjustments: '',
    branchCode: currentBranch
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      branchCode: currentBranch,
      partnerSharePercent: isKolhapur ? 75 : 50
    }));
    fetchSettlements();
  }, [selectedBranch]);

  const fetchSettlements = () => {
    fetch('/api/partner-settlements')
      .then(res => res.json())
      .then(data => setSettlements(Array.isArray(data) ? data : []))
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
          branchCode: currentBranch
        })
      });

      if (res.ok) {
        fetchSettlements();
        setFormData({
          periodMonth: 'September 2026',
          grossRevenue: '',
          totalExpenses: '',
          partnerSharePercent: defaultShare,
          crossBranchIncentiveAdjustments: '',
          branchCode: currentBranch
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeAgreement = isKolhapur ? AGREEMENTS_INFO[2] : (currentBranch.toLowerCase().includes('pune') ? AGREEMENTS_INFO[1] : AGREEMENTS_INFO[0]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)', 
        padding: '24px', 
        borderRadius: '20px', 
        border: '1.5px solid rgba(14, 116, 144, 0.4)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #0e7490, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: '#fff' }}>
                Franchise Partner Settlement Ledger — {currentBranch}
              </h2>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>
                {activeAgreement.title}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
            {activeAgreement.detail}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', textTransform: 'uppercase', display: 'block' }}>Exclusive MH Partners</span>
            <strong style={{ fontSize: '12.5px', color: '#fff' }}>Career Vidyalaya & Nilanjan</strong>
          </div>
        </div>
      </div>

      {/* 3 Agreements Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {AGREEMENTS_INFO.map((agr, idx) => {
          const isSelected = agr.id === activeAgreement.id;
          return (
            <div
              key={agr.id}
              style={{
                background: isSelected ? 'linear-gradient(135deg, rgba(14, 116, 144, 0.15), rgba(15, 23, 42, 0.8))' : 'var(--bg-card)',
                border: isSelected ? '1.5px solid #06b6d4' : '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: isSelected ? '0 8px 24px -4px rgba(6, 182, 212, 0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Award className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: isSelected ? '#38bdf8' : 'var(--text-white)', margin: 0 }}>
                  {agr.title}
                </h4>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-slate-400)', margin: '4px 0 8px 0', lineHeight: '1.4' }}>
                {agr.detail}
              </p>
              <span style={{
                fontSize: '10px',
                fontWeight: '900',
                padding: '3px 8px',
                borderRadius: '6px',
                background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#38bdf8' : 'var(--text-slate-300)'
              }}>
                {agr.subtitle}
              </span>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid-2">
        
        {/* Entry Form */}
        <div className="dashboard-panel-card">
          <div className="panel-title-bar">
            <h3 className="panel-heading">Record Monthly Franchise Settlement</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              required
              placeholder="Settlement Month (e.g. September 2026) *"
              value={formData.periodMonth}
              onChange={(e) => setFormData({ ...formData, periodMonth: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Gross Inflow Revenue (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="₹ 0"
                  value={formData.grossRevenue}
                  onChange={(e) => setFormData({ ...formData, grossRevenue: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--emerald-primary)', fontWeight: 'bold', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Total Operating Expenses (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="₹ 0"
                  value={formData.totalExpenses}
                  onChange={(e) => setFormData({ ...formData, totalExpenses: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--rose-primary)', fontWeight: 'bold', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Partner Pool Share (%)</label>
                <input
                  type="number"
                  value={formData.partnerSharePercent}
                  onChange={(e) => setFormData({ ...formData, partnerSharePercent: parseFloat(e.target.value) || 50 })}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Cross-Branch Incentives (₹)</label>
                <input
                  type="number"
                  placeholder="± Adjustment"
                  value={formData.crossBranchIncentiveAdjustments}
                  onChange={(e) => setFormData({ ...formData, crossBranchIncentiveAdjustments: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--amber-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-green" style={{ marginTop: '8px', padding: '12px' }}>
              <Plus className="w-4 h-4" />
              <span>Record Settlement to Ledger</span>
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
                <th style={{ textAlign: 'right' }}>Partner Pool Share</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-slate-400)' }}>
                    No settlements recorded yet for {currentBranch}.
                  </td>
                </tr>
              ) : (
                settlements.map((item) => (
                  <tr key={item.id || item._id}>
                    <td>
                      <strong style={{ color: '#fff', display: 'block' }}>{item.periodMonth}</strong>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)' }}>{item.branchCode}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>₹{item.grossRevenue?.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)' }}>₹{item.netProfitPool?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '900', color: 'var(--emerald-primary)' }}>
                      ₹{item.finalSettlementAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}><span className="badge-pill badge-paid">{item.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
