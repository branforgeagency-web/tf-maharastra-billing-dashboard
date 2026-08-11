import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, Sparkles, Building, ArrowLeft, BarChart3, HelpCircle, CheckCircle2, ArrowRightLeft, DollarSign, Wallet, AlertTriangle, Zap, Users, User, Info, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MAHARASHTRA_BRANCHES = ['Pune (FC Road) ★', 'Kolhapur (Tarabai Park) ★', 'All Branches (Global View)'];

export default function ProfitLossView({ selectedBranch, setSelectedBranch }) {
  const [periodMode, setPeriodMode] = useState('Monthly'); // Monthly | Quarterly | Yearly
  const [selectedMonth, setSelectedMonth] = useState('All Period');
  const [vouchers, setVouchers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [dailyLeads, setDailyLeads] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedBranch, selectedMonth, periodMode]);

  const fetchData = async () => {
    try {
      const branchQuery = selectedBranch ? `?branch=${encodeURIComponent(selectedBranch)}` : '';
      const [vRes, rRes, lRes] = await Promise.all([
        fetch(`/api/vouchers${branchQuery}`),
        fetch(`/api/receipts${branchQuery}`),
        fetch(`/api/daily-leads${branchQuery}`)
      ]);
      
      const vData = await vRes.json();
      const rData = await rRes.json();
      const lData = await lRes.json();

      setVouchers(Array.isArray(vData) ? vData : []);
      setReceipts(Array.isArray(rData) ? rData : []);
      setDailyLeads(Array.isArray(lData) ? lData : []);
    } catch (err) {
      console.error('Error fetching P&L data:', err);
    }
  };

  const branchName = selectedBranch ? selectedBranch.replace('★', '').trim() : 'Pune (FC Road)';

  // Filter Data by Period if selected
  const filteredReceipts = selectedMonth === 'All Period' 
    ? receipts 
    : receipts.filter(r => r.dateOfReceipt && r.dateOfReceipt.startsWith(selectedMonth.slice(0, 7)));

  const filteredVouchers = selectedMonth === 'All Period' 
    ? vouchers 
    : vouchers.filter(v => v.voucherDate && v.voucherDate.startsWith(selectedMonth.slice(0, 7)));

  // Financial Calculations
  const totalIncome = filteredReceipts.reduce((a, r) => a + (r.amountPayingNow || 0), 0);
  const totalExpenses = filteredVouchers.reduce((a, v) => a + (v.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const isLoss = netProfit < 0;
  const eachPartnerShare = Math.round(netProfit / 2);

  // Committed Business & Pending Balance
  const totalCommittedBusiness = filteredReceipts.reduce((a, r) => a + (r.courseFee || 0), 0);
  const totalPendingBalance = filteredReceipts.reduce((a, r) => a + (r.pendingBalance || 0), 0);
  const grossProfit = totalCommittedBusiness - totalExpenses;

  // Revenue Breakdown by Categories
  const revenueCategories = [
    { cat: 'Course Fee', label: 'Course Fee Income', desc: 'Student tuition in ₹' },
    { cat: 'Exam Fee', label: 'Exam Fee Income', desc: 'AAPC / AHIMA vouchers' },
    { cat: 'Book Fee', label: 'Book Fee Income', desc: 'Books & study materials' },
    { cat: 'Courier Fee', label: 'Courier Fee Income', desc: 'Shipping & logistics' },
    { cat: 'College Revenue', label: 'College Revenue', desc: '🎓 B2B · institution' },
    { cat: 'Company Revenue', label: 'Company Revenue', desc: '🏢 B2B · SEZ / non-SEZ' }
  ].map(item => {
    const amt = filteredReceipts
      .filter(r => (r.receiptCategory === item.cat) || (!r.receiptCategory && item.cat === 'Course Fee'))
      .reduce((a, r) => a + (r.amountPayingNow || 0), 0);
    return { ...item, amount: amt };
  }).filter(item => item.amount > 0 || selectedMonth === 'All Period');

  // Operating Expenses Breakdown
  const expenseCategories = filteredVouchers.reduce((acc, v) => {
    const cat = v.category || 'Miscellaneous';
    if (!acc[cat]) {
      acc[cat] = { category: cat, total: 0, party: v.party || 'Partner', account: v.account || 'Cash', count: 0 };
    }
    acc[cat].total += (v.amount || 0);
    acc[cat].count += 1;
    return acc;
  }, {});

  const expenseCategoryList = Object.values(expenseCategories);

  // Settlement Pocket Calculations
  const mgmtCollected = filteredReceipts.filter(r => r.party === 'Management').reduce((a, r) => a + (r.amountPayingNow || 0), 0);
  const mgmtPaid = filteredVouchers.filter(v => v.party === 'Management').reduce((a, v) => a + (v.amount || 0), 0);
  const mgmtNetCash = mgmtCollected - mgmtPaid;

  const partnerCollected = filteredReceipts.filter(r => r.party === 'Partner').reduce((a, r) => a + (r.amountPayingNow || 0), 0);
  const partnerPaid = filteredVouchers.filter(v => v.party === 'Partner').reduce((a, v) => a + (v.amount || 0), 0);
  const partnerNetCash = partnerCollected - partnerPaid;

  // Fair share (50% of pooled net profit/loss)
  const fairShare = eachPartnerShare;

  // Settlement Transfer logic
  // Partner's cash position after receipts & expenses: partnerNetCash
  // Partner's target net position after 50-50 split: fairShare
  // Transfer needed = fairShare - partnerNetCash
  const settlementTransfer = fairShare - partnerNetCash;

  // Monthly Breakdown Rows for "Year at a glance" Table
  const monthsMap = {};
  receipts.forEach(r => {
    const m = r.dateOfReceipt ? r.dateOfReceipt.slice(0, 7) : 'Unknown';
    if (!monthsMap[m]) monthsMap[m] = { month: m, leads: 0, committed: 0, collected: 0, pending: 0, expenses: 0 };
    monthsMap[m].committed += (r.courseFee || 0);
    monthsMap[m].collected += (r.amountPayingNow || 0);
    monthsMap[m].pending += (r.pendingBalance || 0);
  });
  vouchers.forEach(v => {
    const m = v.voucherDate ? v.voucherDate.slice(0, 7) : 'Unknown';
    if (!monthsMap[m]) monthsMap[m] = { month: m, leads: 0, committed: 0, collected: 0, pending: 0, expenses: 0 };
    monthsMap[m].expenses += (v.amount || 0);
  });

  const monthRows = Object.values(monthsMap).map(row => {
    const net = row.collected - row.expenses;
    const gross = row.committed - row.expenses;
    const formattedMonth = new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return { ...row, formattedMonth, netProfit: net, grossProfit: gross };
  }).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* 1. Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/income-expense" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-slate-400)', textDecoration: 'none', fontWeight: '700' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #00897b, #004d40)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(0, 137, 123, 0.3)' }}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 style={{ fontSize: '19px', fontWeight: '900', margin: 0, color: 'var(--text-white)' }}>Profit & Loss Statement</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>Auto-calculated from receipts & vouchers</p>
            </div>
          </div>
        </div>

        {/* View Mode Buttons (Monthly / Quarterly / Yearly) */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {['Monthly', 'Quarterly', 'Yearly'].map(m => (
            <button
              key={m}
              onClick={() => setPeriodMode(m)}
              className={`action-btn ${periodMode === m ? 'action-btn-wa' : ''}`}
              style={{ padding: '7px 16px', fontSize: '12px', fontWeight: '800' }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Showing P&L Banner Box */}
      <div style={{ background: 'var(--bg-card)', padding: '18px 22px', borderRadius: '18px', border: '1px solid var(--border-color)', borderLeft: '5px solid var(--tf-teal-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.6px' }}>SHOWING P&L FOR</span>
          <h2 style={{ fontSize: '17px', fontWeight: '900', margin: '3px 0', color: 'var(--text-white)' }}>{branchName}</h2>
          <p style={{ fontSize: '12px', color: 'var(--tf-teal-primary)', fontWeight: '700', margin: 0 }}>
            50-50 franchise partnership · Live database calculations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {setSelectedBranch && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ padding: '9px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontWeight: '800', fontSize: '13px', outline: 'none', cursor: 'pointer', minWidth: '180px' }}
            >
              {MAHARASHTRA_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)' }}>Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: '9px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontWeight: 'bold', fontSize: '13px', outline: 'none' }}
            >
              <option value="All Period">All Period (Database)</option>
              {monthRows.map(m => (
                <option key={m.month} value={m.month}>{m.formattedMonth}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Year at a glance · month-on-month performance Table */}
      <div className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h3 className="panel-heading" style={{ color: 'var(--tf-teal-primary)' }}>
            <TrendingUp className="w-5 h-5 text-teal-600" />
            P&L · {selectedMonth === 'All Period' ? 'Year at a glance' : selectedMonth} · {branchName}
          </h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '0 0 14px 0', lineHeight: '1.4' }}>
          Year at a glance · month-on-month performance<br />
          <span style={{ fontSize: '11px' }}>All months with activity. <strong>Net Profit</strong> = collected − expenses. <strong>Gross Profit</strong> = total business committed − expenses.</span>
        </p>

        <div className="portal-table-container">
          <table className="portal-data-table">
            <thead>
              <tr style={{ background: 'var(--bg-input)' }}>
                <th>Month</th>
                <th style={{ textAlign: 'center' }}>Leads</th>
                <th style={{ textAlign: 'right' }}>Total Business</th>
                <th style={{ textAlign: 'right' }}>Collected</th>
                <th style={{ textAlign: 'right' }}>Pending</th>
                <th style={{ textAlign: 'right' }}>Expenses</th>
                <th style={{ textAlign: 'right' }}>Net Profit</th>
                <th style={{ textAlign: 'right' }}>Gross Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-slate-400)', padding: '24px' }}>
                    No receipts or vouchers recorded for this period. Create new receipts or vouchers to see monthly P&L metrics.
                  </td>
                </tr>
              ) : (
                monthRows.map((row) => (
                  <tr key={row.month}>
                    <td><strong>{row.formattedMonth}</strong></td>
                    <td style={{ textAlign: 'center' }}>{row.leads || 0}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{row.committed.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--tf-teal-primary)', fontWeight: 'bold' }}>
                      ₹{row.collected.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>₹{row.pending.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>₹{row.expenses.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: row.netProfit >= 0 ? 'var(--tf-teal-primary)' : '#fb7185', fontWeight: 'bold' }}>
                      {row.netProfit < 0 ? '-' : ''}₹{Math.abs(row.netProfit).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: row.grossProfit >= 0 ? 'var(--text-white)' : '#fb7185' }}>
                      {row.grossProfit < 0 ? '-' : ''}₹{Math.abs(row.grossProfit).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
              {monthRows.length > 0 && (
                <tr style={{ background: 'var(--bg-input)', fontWeight: 'bold' }}>
                  <td>Total · {monthRows.length} months</td>
                  <td style={{ textAlign: 'center' }}>0</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{totalCommittedBusiness.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--tf-teal-primary)' }}>₹{totalIncome.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>₹{totalPendingBalance.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>₹{totalExpenses.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: netProfit >= 0 ? 'var(--tf-teal-primary)' : '#fb7185', fontSize: '14px' }}>
                    {netProfit < 0 ? '-' : ''}₹{Math.abs(netProfit).toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: grossProfit >= 0 ? 'var(--text-white)' : '#fb7185', fontSize: '14px' }}>
                    {grossProfit < 0 ? '-' : ''}₹{Math.abs(grossProfit).toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Revenue / Income (from receipts) */}
      <div className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h3 className="panel-heading" style={{ color: 'var(--tf-teal-primary)' }}>
            Revenue / Income (from receipts)
          </h3>
        </div>

        <div className="portal-table-container">
          <table className="portal-data-table">
            <tbody>
              {revenueCategories.length === 0 || totalIncome === 0 ? (
                <tr>
                  <td colSpan={2} style={{ color: 'var(--text-slate-400)' }}>
                    No income recorded
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹0</td>
                </tr>
              ) : (
                revenueCategories.map((item) => (
                  <tr key={item.cat}>
                    <td>
                      <strong>{item.label}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block' }}>{item.desc}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--tf-teal-primary)' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
              <tr style={{ background: 'rgba(0, 137, 123, 0.08)', fontWeight: '900' }}>
                <td style={{ color: 'var(--text-white)', fontSize: '14px' }}>Total Revenue</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--tf-teal-primary)', fontSize: '16px' }}>
                  ₹{totalIncome.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Operating Expenses (from vouchers) */}
      <div className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h3 className="panel-heading" style={{ color: '#fb7185' }}>
            Operating Expenses (from vouchers)
          </h3>
        </div>

        {/* How shared costs work explanation banner */}
        <div style={{ background: 'rgba(217, 119, 6, 0.08)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(217, 119, 6, 0.3)', marginBottom: '16px', fontSize: '12px', color: 'var(--text-slate-200)', lineHeight: '1.6' }}>
          📌 <strong>How shared costs work:</strong> The "Partner paid" / "Management paid" tags below only show whose pocket the cash came from. Every operating expense is pooled and split 50-50 for partnership profit — whoever paid more than their fair share gets reimbursed via the Settlement card. e.g. if Management bought a ₹40,000 laptop, Partner's half (₹20,000) gets credited back through settlement.
        </div>

        {/* Color key badges */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)' }}>Color key:</span>
          <span className="badge-pill" style={{ background: 'rgba(0, 137, 123, 0.12)', color: 'var(--tf-teal-primary)', border: '1px solid rgba(0, 137, 123, 0.3)' }}>👤 Partner paid</span>
          <span className="badge-pill" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.3)' }}>🏦 Management paid</span>
          <span className="badge-pill" style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#8b5cf6', border: '1px solid rgba(124, 58, 237, 0.3)' }}>Both</span>
        </div>

        <div className="portal-table-container">
          <table className="portal-data-table">
            <tbody>
              {expenseCategoryList.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ color: 'var(--text-slate-400)', padding: '16px' }}>
                    No operating expenses recorded
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹0</td>
                </tr>
              ) : (
                expenseCategoryList.map((item) => (
                  <tr key={item.category}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{item.category}</strong>
                        <span className="badge-pill" style={{ background: item.party === 'Management' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 137, 123, 0.12)', color: item.party === 'Management' ? '#0284c7' : 'var(--tf-teal-primary)', fontSize: '10px' }}>
                          {item.party === 'Management' ? '🏦 Management paid' : '👤 Partner paid'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '2px' }}>
                        🏦 Account: {item.account} · ₹{item.total.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: '#fb7185' }}>
                      ₹{item.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
              <tr style={{ background: 'rgba(225, 29, 72, 0.08)', fontWeight: '900' }}>
                <td style={{ color: 'var(--text-white)', fontSize: '14px' }}>Total Expenses</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fb7185', fontSize: '16px' }}>
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Net Profit / Net Loss Banner */}
        <div style={{ 
          marginTop: '16px', 
          background: isLoss ? 'linear-gradient(135deg, #e11d48, #9f1239)' : 'linear-gradient(135deg, #00897b, #004d40)', 
          padding: '18px 22px', 
          borderRadius: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          color: '#fff', 
          boxShadow: isLoss ? '0 6px 20px rgba(225, 29, 72, 0.3)' : '0 6px 20px rgba(0, 137, 123, 0.3)' 
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
              {isLoss ? `Net Loss -₹${Math.abs(netProfit).toLocaleString('en-IN')}` : `Net Profit ₹${netProfit.toLocaleString('en-IN')}`}
            </h3>
            <span style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px', display: 'block' }}>
              Based on {filteredReceipts.length} receipts and {filteredVouchers.length} vouchers in this period
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
            {isLoss ? `-₹${Math.abs(netProfit).toLocaleString('en-IN')}` : `₹${netProfit.toLocaleString('en-IN')}`}
          </div>
        </div>
      </div>

      {/* 6. Partner Distribution Card */}
      <div className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h3 className="panel-heading" style={{ color: 'var(--tf-teal-primary)' }}>
            <Users className="w-5 h-5 text-teal-600" />
            Partner distribution · {selectedMonth} · {branchName}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', margin: '12px 0 16px 0' }}>
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>Total Income</span>
            <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--tf-teal-primary)', marginTop: '4px' }}>
              ₹{totalIncome.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>Total Expenses</span>
            <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#fb7185', marginTop: '4px' }}>
              ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>Net Profit / Loss</span>
            <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: isLoss ? '#fb7185' : 'var(--tf-teal-primary)', marginTop: '4px' }}>
              {isLoss ? '-' : ''}₹{Math.abs(netProfit).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(0, 137, 123, 0.12)', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--tf-teal-primary)' }}>
            <span style={{ fontSize: '11px', color: 'var(--tf-teal-primary)', fontWeight: '800', textTransform: 'uppercase' }}>Each partner (50%)</span>
            <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--tf-teal-primary)', marginTop: '4px' }}>
              {eachPartnerShare < 0 ? '-' : ''}₹{Math.abs(eachPartnerShare).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '11.5px', color: 'var(--text-slate-400)' }}>
          Based on the 50-50 franchise model: <strong>HQ Coimbatore</strong> & the <strong>{branchName} franchisee</strong> split net profit equally after expenses.
        </div>
      </div>

      {/* 7. Net Settlement Card */}
      <div className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h3 className="panel-heading" style={{ color: 'var(--amber-primary)' }}>
            <ArrowRightLeft className="w-5 h-5 text-amber-500" />
            ₹ Net settlement · {branchName} · {selectedMonth}
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontWeight: '700' }}>Party = Management vs Partner</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '14px' }}>
          
          {/* HQ (Management Party) */}
          <div style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#0284c7', textTransform: 'uppercase', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 className="w-4 h-4" />
              HQ (Management party)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-slate-400)' }}>Collected as Management</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{mgmtCollected.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-slate-400)' }}>Paid as Management</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{mgmtPaid.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                <span>Net cash position</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: mgmtNetCash >= 0 ? 'var(--tf-teal-primary)' : '#fb7185' }}>
                  {mgmtNetCash < 0 ? '-' : ''}₹{Math.abs(mgmtNetCash).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Fair share (50%)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)' }}>
                  {fairShare < 0 ? '-' : ''}₹{Math.abs(fairShare).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Branch Partner (Partner Party) */}
          <div style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--tf-teal-primary)', textTransform: 'uppercase', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User className="w-4 h-4" />
              {branchName} (Partner party)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-slate-400)' }}>Collected as Partner</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{partnerCollected.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-slate-400)' }}>Paid as Partner</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{partnerPaid.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                <span>Net cash position</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: partnerNetCash >= 0 ? 'var(--tf-teal-primary)' : '#fb7185' }}>
                  {partnerNetCash < 0 ? '-' : ''}₹{Math.abs(partnerNetCash).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Fair share (50%)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)' }}>
                  {fairShare < 0 ? '-' : ''}₹{Math.abs(fairShare).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Settlement Transfer Box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(245, 158, 11, 0.05))', border: '1.5px solid rgba(217, 119, 6, 0.4)', padding: '18px 22px', borderRadius: '16px', marginTop: '18px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--amber-primary)', letterSpacing: '0.6px' }}>SETTLEMENT TRANSFER</span>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--amber-primary)', margin: '4px 0' }}>
            {settlementTransfer > 0 
              ? `HQ pays ${branchName} partner ₹${Math.abs(settlementTransfer).toLocaleString('en-IN')}`
              : settlementTransfer < 0
              ? `${branchName} partner pays HQ ₹${Math.abs(settlementTransfer).toLocaleString('en-IN')}`
              : 'Accounts are fully balanced (₹0 transfer)'
            }
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-slate-400)', margin: 0 }}>
            After settlement, both parties have borne ₹{Math.abs(fairShare).toLocaleString('en-IN')} of the {isLoss ? 'loss' : 'profit'} — exactly their 50% share.
          </p>
        </div>

        {/* Management-Party Warning Banner (Triggered when 0 Mgmt transactions exist) */}
        {(mgmtCollected === 0 && mgmtPaid === 0) && (
          <div style={{ marginTop: '14px', background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '14px 18px', borderRadius: '14px', color: '#b45309', fontSize: '12px', lineHeight: '1.5', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 style={{ marginTop: '2px' }}" />
            <div>
              <strong>⚠ No Management-party transactions recorded for {branchName} this period.</strong> If HQ paid rent/salaries/laptops or collected any fee directly, mark those vouchers/receipts with Party = Management — or use the "Add HQ expense/receipt" buttons on the HQ overview. Otherwise the settlement assumes 100% partner-side, which won't match reality.
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
