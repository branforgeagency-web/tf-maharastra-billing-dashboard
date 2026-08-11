import React, { useState, useEffect } from 'react';
import { Landmark, Calculator, FileCheck, ShieldCheck, ArrowLeft, Plus, CheckCircle2, AlertCircle, HelpCircle, Save, TrendingUp, DollarSign, Wallet, Building2, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BalanceSheetView({ selectedBranch, setSelectedBranch }) {
  const [quarter, setQuarter] = useState('2026 · Q3');
  const [snapshots, setSnapshots] = useState([]);
  
  // Assets State
  const [assets, setAssets] = useState({
    cashInHand: 0,
    bankBalance: 0,
    receivables: 0,
    equipment: 0,
    deposits: 0,
    otherAssets: 0
  });

  // Liabilities State
  const [liabilities, setLiabilities] = useState({
    payables: 0,
    bankLoans: 0,
    salaryPayable: 0,
    rentUtilityDues: 0,
    hqPayable: 0,
    otherLiabilities: 0
  });

  // Quick GST Calculator State
  const [quickCalcInput, setQuickCalcInput] = useState(21000);

  // Live Database Collections State
  const [receipts, setReceipts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [b2bList, setB2bList] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedBranch]);

  const fetchData = async () => {
    try {
      const [rRes, vRes, bRes, bsRes] = await Promise.all([
        fetch(`/api/receipts?branch=${encodeURIComponent(selectedBranch)}`),
        fetch(`/api/vouchers?branch=${encodeURIComponent(selectedBranch)}`),
        fetch(`/api/b2b`),
        fetch(`/api/balance-sheet?branch=${encodeURIComponent(selectedBranch)}`)
      ]);
      const rData = await rRes.json();
      const vData = await vRes.json();
      const bData = await bRes.json();
      const bsData = await bsRes.json();

      const loadedReceipts = Array.isArray(rData) ? rData : [];
      setReceipts(loadedReceipts);
      setVouchers(Array.isArray(vData) ? vData : []);
      setB2bList(Array.isArray(bData) ? bData : []);
      setSnapshots(Array.isArray(bsData) ? bsData : []);

      // Auto pre-fill receivables from active pending balances
      const pendingTotal = loadedReceipts.reduce((a, r) => a + (r.pendingBalance || 0), 0);
      setAssets(prev => ({ ...prev, receivables: pendingTotal }));
    } catch (err) {
      console.error(err);
    }
  };

  // Asset Totals
  const totalAssets = Object.values(assets).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Save Snapshot to MongoDB
  const handleSaveSnapshot = async () => {
    const payload = {
      branchCode: selectedBranch || 'Pune (FC Road) ★',
      quarter,
      fyYear: 'FY 2026-27',
      assets: {
        cashInHand: assets.cashInHand,
        idfcMainBank: assets.bankBalance,
        accountsReceivable: assets.receivables,
        capitalAssets: assets.equipment
      },
      liabilities: {
        accountsPayable: liabilities.payables
      },
      totalAssets,
      totalLiabilities,
      netWorth,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/balance-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
        alert('Balance sheet quarter snapshot saved successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick GST Calculations (Total / 1.18)
  const calcAmount = parseFloat(quickCalcInput) || 0;
  const calcBase = (calcAmount / 1.18).toFixed(2);
  const calcGst = (calcAmount - calcBase).toFixed(2);

  // GST Liability Computations from Receipts & B2B
  const idfcReceipts = receipts.filter(r => r.account === 'IDFC Main');
  const idfcTuitionGst = idfcReceipts.reduce((a, r) => a + (r.gstAmount || 0), 0);
  const idfcTuitionBase = idfcReceipts.reduce((a, r) => a + (r.taxableValue || 0), 0);
  const idfcTuitionTotal = idfcReceipts.reduce((a, r) => a + (r.amountPayingNow || 0), 0);

  const collegeB2b = b2bList.filter(b => b.institutionType === 'College');
  const companyB2b = b2bList.filter(b => b.institutionType === 'Company');
  const collegeB2bGst = collegeB2b.reduce((a, b) => a + (b.isSez ? 0 : (b.totalAmount || 0) * 0.18), 0);
  const companyB2bGst = companyB2b.reduce((a, b) => a + (b.isSez ? 0 : (b.totalAmount || 0) * 0.18), 0);
  const totalB2bGst = collegeB2bGst + companyB2bGst;
  const totalB2bBase = b2bList.reduce((a, b) => a + (b.totalAmount || 0), 0);

  const totalGstLiability = idfcTuitionGst + totalB2bGst;

  // ITR & Tax Compliance Computations
  const annualTurnover = receipts.reduce((a, r) => a + (r.amountPayingNow || 0), 0);
  const annualExpenses = vouchers.reduce((a, v) => a + (v.amount || 0), 0);
  const taxableProfitPbt = annualTurnover - annualExpenses;

  const branchCode = selectedBranch?.includes('Kolhapur') ? 'KP' : 'PN';
  const branchDisplayName = selectedBranch ? selectedBranch.replace('★', '').trim() : 'Pune (FC Road)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/income-expense" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-slate-400)', textDecoration: 'none', fontWeight: '600' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }}>
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>Balance Sheet</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>Quarterly snapshot · track growth</p>
            </div>
          </div>
        </div>

        {/* Quarter & Branch Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {setSelectedBranch && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontWeight: 'bold', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Pune (FC Road) ★">Pune (FC Road) ★</option>
              <option value="Kolhapur (Tarabai Park) ★">Kolhapur (Tarabai Park) ★</option>
              <option value="All Branches (Global View)">All Branches (Global View)</option>
            </select>
          )}

          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontWeight: 'bold', fontSize: '13px', outline: 'none' }}
          >
            <option value="2026 · Q3">2026 · Q3</option>
            <option value="2026 · Q2">2026 · Q2</option>
            <option value="2026 · Q1">2026 · Q1</option>
          </select>
        </div>
      </div>

      {/* Branch Balance Sheet Banner Card */}
      <div style={{ background: 'var(--bg-card)', padding: '18px 22px', borderRadius: '16px', border: '1.5px solid var(--border-color)', borderLeft: '4px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            {branchCode}
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px' }}>BALANCE SHEET FOR</span>
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: '2px 0', color: 'var(--text-white)' }}>{branchDisplayName}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
              50-50 franchise partnership
            </p>
          </div>
        </div>
      </div>

      {/* Creative Two-Column Grid: Assets vs Liabilities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Assets Panel Card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '18px', border: '1.5px solid var(--border-color)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--emerald-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet className="w-5 h-5" />
              Assets
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontWeight: '700' }}>Current & Fixed Assets</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'cashInHand', label: 'Cash in hand', sub: 'Physical branch cash' },
              { key: 'bankBalance', label: 'Bank balance', sub: 'IDFC Main & bank accounts' },
              { key: 'receivables', label: 'Receivables (fees due)', sub: 'Student & B2B pending fees' },
              { key: 'equipment', label: 'Equipment & furniture', sub: 'Capital assets & hardware' },
              { key: 'deposits', label: 'Deposits (rent, etc.)', sub: 'Security deposits' },
              { key: 'otherAssets', label: 'Other assets', sub: 'Miscellaneous receivables' },
            ].map(item => (
              <div key={item.key} style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'block' }}>{item.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>{item.sub}</span>
                </div>
                <input
                  type="number"
                  value={assets[item.key]}
                  onChange={(e) => setAssets({ ...assets, [item.key]: parseFloat(e.target.value) || 0 })}
                  style={{ width: '130px', padding: '8px 12px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--emerald-primary)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          {/* Total Assets Summary Footer */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-white)' }}>Total Assets</span>
            <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)', fontWeight: '900' }}>
              ₹{totalAssets.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Liabilities Panel Card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '18px', border: '1.5px solid var(--border-color)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fb7185', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              Liabilities
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontWeight: '700' }}>Current & Long-term Dues</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'payables', label: 'Payables (vendors due)', sub: 'Unpaid vendor invoices' },
              { key: 'bankLoans', label: 'Bank / business loans', sub: 'Outstanding loan principle' },
              { key: 'salaryPayable', label: 'Salary payable', sub: 'Pending staff payroll' },
              { key: 'rentUtilityDues', label: 'Rent & utility dues', sub: 'Unpaid rent & EB bills' },
              { key: 'hqPayable', label: 'HQ payable (franchise)', sub: 'Head Office dues' },
              { key: 'otherLiabilities', label: 'Other liabilities', sub: 'Other outstanding dues' },
            ].map(item => (
              <div key={item.key} style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'block' }}>{item.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>{item.sub}</span>
                </div>
                <input
                  type="number"
                  value={liabilities[item.key]}
                  onChange={(e) => setLiabilities({ ...liabilities, [item.key]: parseFloat(e.target.value) || 0 })}
                  style={{ width: '130px', padding: '8px 12px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: '#fb7185', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          {/* Total Liabilities Summary Footer */}
          <div style={{ background: 'rgba(251, 113, 133, 0.08)', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid rgba(251, 113, 133, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-white)' }}>Total Liabilities</span>
            <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', color: '#fb7185', fontWeight: '900' }}>
              ₹{totalLiabilities.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

      </div>

      {/* Net Worth Banner & Save Action Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.14) 0%, rgba(15, 23, 42, 0.95) 100%)', padding: '22px 26px', borderRadius: '18px', border: '1.5px solid rgba(8, 145, 178, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(8, 145, 178, 0.15)' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--cyan-primary)', letterSpacing: '0.6px' }}>NET WORTH (ASSETS − LIABILITIES)</span>
          <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '4px 0 0 0', color: '#fff', fontFamily: 'var(--font-mono)' }}>
            For {quarter} — <span style={{ color: netWorth >= 0 ? 'var(--emerald-primary)' : '#fb7185' }}>₹{netWorth.toLocaleString('en-IN')}</span>
          </h2>
        </div>

        <button onClick={handleSaveSnapshot} className="btn-primary-green" style={{ background: 'var(--tf-teal-primary)', padding: '12px 24px', fontSize: '14px' }}>
          <Save className="w-5 h-5" />
          <span>Save quarter snapshot</span>
        </button>
      </div>

      {/* Section: Quarterly Growth Table */}
      <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '18px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp className="w-5 h-5 text-teal-500" />
            Quarterly growth
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-slate-400)' }}>{snapshots.length} saved snapshots</span>
        </div>

        {snapshots.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-slate-400)', fontSize: '13px', background: 'var(--bg-input)', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
            <strong style={{ color: 'var(--text-white)', display: 'block', marginBottom: '4px', fontSize: '14px' }}>No quarterly snapshots saved yet</strong>
            Fill in assets & liabilities above and click "Save quarter snapshot" to track historical balance sheet growth.
          </div>
        ) : (
          <div className="portal-table-container">
            <table className="portal-data-table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Date Saved</th>
                  <th style={{ textAlign: 'right' }}>Total Assets</th>
                  <th style={{ textAlign: 'right' }}>Total Liabilities</th>
                  <th style={{ textAlign: 'right' }}>Net Worth</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: '#fff' }}>{s.quarter}</strong></td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>{s.date}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)', fontWeight: 'bold' }}>₹{(s.totalAssets || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fb7185', fontWeight: 'bold' }}>₹{(s.totalLiabilities || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '900', color: 'var(--cyan-primary)', fontSize: '14px' }}>₹{(s.netWorth || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section: GST Calculator & Liability (· this month) */}
      <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '18px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator className="w-5 h-5 text-cyan-400" />
              GST Calculator & Liability · this month
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
              IDFC Main only · GST paid to government from this account
            </p>
          </div>
        </div>

        {/* ⚡ Quick calculator widget */}
        <div style={{ background: 'var(--bg-input)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--amber-primary)', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
            ⚡ QUICK GST SPLIT CALCULATOR
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.2fr 2fr 0.2fr 2fr', gap: '10px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Inclusive of GST (split into base + GST)</label>
              <input
                type="number"
                value={quickCalcInput}
                onChange={(e) => setQuickCalcInput(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 21000"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--cyan-primary)', fontWeight: '900', fontSize: '15px', fontFamily: 'var(--font-mono)', outline: 'none' }}
              />
            </div>

            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-slate-400)' }}>=</div>

            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', textTransform: 'uppercase', display: 'block' }}>Base (taxable value)</span>
              <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                ₹{parseFloat(calcBase).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-slate-400)' }}>+</div>

            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', textTransform: 'uppercase', display: 'block' }}>GST @ 18%</span>
              <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)' }}>
                ₹{parseFloat(calcGst).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '11.5px', color: 'var(--text-slate-400)', lineHeight: '1.5' }}>
            💡 <strong>Course fees in the system are stored as inclusive of GST.</strong> Enter ₹21,000 → see Base ₹17,797 + GST ₹3,203 (the GST portion you owe to the government).
          </div>
        </div>

        {/* 3 GST Breakdown Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px' }}>
          
          {/* Card 1: Tuition Fees IDFC Main */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--cyan-primary)', display: 'block' }}>GST On Tuition Fees (Course) · IDFC Main</span>
            <div style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--cyan-primary)', margin: '6px 0 2px 0' }}>
              ₹{idfcTuitionGst.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '10px' }}>
              from {idfcReceipts.length} IDFC Main receipts
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-slate-300)', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Taxable value (base)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{idfcTuitionBase.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST rate</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>18%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total inclusive</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{idfcTuitionTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Card 2: B2B Revenue */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--emerald-primary)', display: 'block' }}>B2B On B2B Revenue (College + Company) · ALL accounts</span>
            <div style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)', margin: '6px 0 2px 0' }}>
              ₹{totalB2bGst.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '10px' }}>
              from {b2bList.length} B2B receipts · all accounts (cash + bank)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-slate-300)', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎓 From College</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{collegeB2bGst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🏢 From Company</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{companyB2bGst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Combined base (taxable)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalB2bBase.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: 'var(--text-slate-500)', lineHeight: '1.4' }}>
              B2B invoices are always GST-charged regardless of payment mode — cash B2B receipts still carry tax liability. SEZ companies = 0% GST.
            </p>
          </div>

          {/* Card 3: SUM Total GST Liability for Filing */}
          <div style={{ background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(15, 23, 42, 0.9))', padding: '16px', borderRadius: '14px', border: '1px solid rgba(217, 119, 6, 0.35)' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--amber-primary)', display: 'block' }}>SUM Total GST Liability for Filing</span>
            <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)', margin: '6px 0 2px 0' }}>
              ₹{totalGstLiability.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '10px' }}>
              B2C: IDFC Main only · B2B: all accounts included
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: 'var(--text-slate-300)', paddingTop: '8px', borderTop: '1px solid rgba(217, 119, 6, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>From Tuition</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{idfcTuitionGst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>From Exam (Slot)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>From Books</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>From Courier</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎓 From College</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{collegeB2bGst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🏢 From Company</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{companyB2bGst.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Section: ITR & Tax Compliance (· FY —) */}
      <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '18px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            ITR & Tax Compliance · FY 2026-27
          </h3>
          <span className="sidebar-badge badge-cyan">Mark filings</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', margin: '12px 0' }}>
          
          {/* Card 1: Annual Turnover */}
          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Annual Turnover</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              ₹{annualTurnover.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>{receipts.length} receipts · excl. exam pass-through</span>
          </div>

          {/* Card 2: Annual Expenses */}
          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Annual Expenses</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#fb7185', fontFamily: 'var(--font-mono)' }}>
              ₹{annualExpenses.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>{vouchers.length} vouchers · operating cost</span>
          </div>

          {/* Card 3: Taxable Profit (PBT) */}
          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Taxable Profit (PBT)</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
              ₹{taxableProfitPbt.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>profit before tax · ITR-3/ITR-5</span>
          </div>

          {/* Card 4: GST Output Collected */}
          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>⚖️ GST Output Collected</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>
              ₹{totalGstLiability.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>total payable to govt · IDFC Main only</span>
          </div>

          {/* Card 5: TDS Deducted by Buyers */}
          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>🧾 TDS Deducted by Buyers</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
              ₹0
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>claim refund / adjust against advance tax</span>
          </div>

          {/* Card 6: Cross-branch Incentives Net */}
          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>🤝 Cross-branch Incentives Net</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
              ₹0
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>received − paid · auto-tracked</span>
          </div>

        </div>

        <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📅 Statutory deadlines & filing status
          </span>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-slate-400)' }}>
            GSTR-1 Monthly Filing: 11th of every month | GSTR-3B Payment: 20th of every month | Advance Tax Q3: 15th December.
          </p>
        </div>

      </div>

    </div>
  );
}
